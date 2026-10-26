import os
import io
import json
import uuid
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image

from backend.config import PATTERN_CLASSES, BASE_DIR
from backend.database import (
    init_db,
    save_inspection,
    get_inspection,
    list_inspections,
    update_review
)
from backend.dataset import dataset_manager, WM811KDatasetManager
from backend.model_service import model_service
from backend.spatial_analysis import analyze_wafer_spatial
from backend.decision_engine import evaluate_decision_and_risk
from backend.root_cause import get_root_cause_hypothesis
from backend.copilot import process_copilot_query
from backend.forecasting import generate_prototype_lot_forecast
from backend.report_generator import generate_pdf_report, export_inspections_to_csv

app = FastAPI(
    title="SEMI NEX AI API",
    description="AI-Powered Semiconductor Quality Intelligence & Decision Support Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    # Check if a model needs training if none exists
    if not model_service.is_loaded:
        try:
            print("[Startup] Training baseline model on loaded dataset samples...")
            model_service.train_on_data(dataset_manager.samples)
        except Exception as e:
            print(f"[Startup] Baseline model training skipped: {e}")

@app.get("/api/status")
def get_system_status():
    ds_info = dataset_manager.get_dataset_info()
    history = list_inspections(limit=1)
    return {
        "status": "online",
        "app_name": "SEMI NEX AI",
        "tagline": "Detect Defects. Compare. Analyze. Decide.",
        "operating_mode": "REAL INFERENCE" if (model_service.is_loaded and ds_info["is_raw_dataset"]) else ("REAL MODEL INFERENCE (BENCHMARK DATASET)" if model_service.is_loaded else "DEMO MODE"),
        "is_model_trained": model_service.is_loaded,
        "model_version": model_service.model_version,
        "model_architecture": model_service.metadata.get("architecture") if model_service.metadata else "Heuristic Prototype",
        "dataset_mode": ds_info["mode"],
        "is_raw_dataset_loaded": ds_info["is_raw_dataset"],
        "total_dataset_records": ds_info["total_records"],
        "labeled_records": ds_info["labeled_records"],
        "database_status": "connected",
        "total_inspections_logged": history["total"],
        "server_time_utc": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/dataset/info")
def get_dataset_info():
    return dataset_manager.get_dataset_info()

@app.get("/api/dataset/samples")
def get_dataset_samples(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    lot: Optional[str] = None,
    search: Optional[str] = None
):
    return dataset_manager.list_samples(limit, offset, category, lot, search)

@app.get("/api/dataset/wafer/{wafer_id}")
def get_wafer_detail(wafer_id: str):
    wafer = dataset_manager.get_wafer_by_id(wafer_id)
    if not wafer:
        raise HTTPException(status_code=404, detail="Wafer record not found")
    
    matrix = np.array(wafer["wafer_map"], dtype=np.uint8)
    spatial = analyze_wafer_spatial(matrix)
    return {
        **wafer,
        "spatial_metrics": spatial
    }

@app.post("/api/inspect")
def inspect_wafer(payload: Dict[str, Any]):
    """
    Core Wafer Inspection API.
    Input can be a wafer_map 2D array or an existing record_id.
    """
    matrix = None
    record_id = payload.get("record_id")
    lot_name = payload.get("lot_name", "lot-unknown")
    wafer_index = payload.get("wafer_index", 1)
    original_label = payload.get("original_label")
    input_source = payload.get("input_source", "WM-811K Dataset")

    if "wafer_map" in payload and payload["wafer_map"]:
        matrix = np.array(payload["wafer_map"], dtype=np.uint8)
    elif record_id:
        record = dataset_manager.get_wafer_by_id(record_id)
        if record:
            matrix = np.array(record["wafer_map"], dtype=np.uint8)
            lot_name = record.get("lot_name", lot_name)
            wafer_index = record.get("wafer_index", wafer_index)
            original_label = record.get("original_label", original_label)
            input_source = "WM-811K Dataset Record"

    if matrix is None or matrix.size == 0:
        raise HTTPException(status_code=400, detail="Valid 2D wafer_map array or record_id is required")

    # 1. Real Model Prediction
    prediction = model_service.predict(matrix)
    spatial = prediction["spatial_metrics"]
    pred_class = prediction["predicted_class"]
    conf = prediction["confidence"]

    # 2. Decision Support & Risk Evaluation
    decision = evaluate_decision_and_risk(
        predicted_class=pred_class,
        confidence=conf,
        failure_rate=spatial["failure_rate"],
        total_dies=spatial["total_die_count"],
        max_cluster_size=spatial["max_cluster_size"],
        clusters=spatial["clusters"]
    )

    # 3. Root Cause Hypothesis
    hypothesis_info = get_root_cause_hypothesis(pred_class)

    # 4. Persistence
    now_utc = datetime.now(timezone.utc)
    insp_id = f"INSP-{now_utc.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    record_payload = {
        "id": insp_id,
        "timestamp": now_utc.isoformat(),
        "input_source": input_source,
        "record_id": record_id or insp_id,
        "lot_name": lot_name,
        "wafer_index": wafer_index,
        "original_label": original_label,
        "predicted_class": pred_class,
        "confidence": conf,
        "class_scores": prediction["class_scores"],
        "model_version": prediction["model_version"],
        "model_mode": prediction["model_mode"],
        "failing_die_count": spatial["failing_die_count"],
        "total_die_count": spatial["total_die_count"],
        "failure_rate": spatial["failure_rate"],
        "recommendation": decision["recommendation"],
        "recommendation_reason": decision["recommendation_reason"],
        "hypothesis": hypothesis_info["title"],
        "review_status": "pending",
        "wafer_map": matrix.tolist()
    }
    save_inspection(record_payload)

    return {
        "inspection_id": insp_id,
        "timestamp": record_payload["timestamp"],
        "input_source": input_source,
        "record_id": record_payload["record_id"],
        "lot_name": lot_name,
        "wafer_index": wafer_index,
        "original_label": original_label,
        "prediction": {
            "predicted_class": pred_class,
            "confidence": conf,
            "class_scores": prediction["class_scores"],
            "model_version": prediction["model_version"],
            "model_mode": prediction["model_mode"],
        },
        "spatial_metrics": spatial,
        "decision_support": decision,
        "root_cause_hypothesis": hypothesis_info,
        "explanation_map": prediction["explanation_map"],
        "wafer_map": matrix.tolist()
    }

@app.post("/api/inspect/upload")
async def upload_and_inspect(file: UploadFile = File(...)):
    """Uploads wafer map image (PNG/JPEG) and processes into discrete die map."""
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("L")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Resize to standard 38x38 wafer map
    img_resized = image.resize((38, 38), Image.Resampling.NEAREST)
    arr = np.array(img_resized)

    # Convert grayscale image to wafer map categories (0=bg, 1=pass, 2=fail)
    # Circle mask
    h, w = arr.shape
    y, x = np.ogrid[:h, :w]
    c_y, c_x = (h - 1) / 2.0, (w - 1) / 2.0
    r = min(c_y, c_x) - 1.5
    mask = ((x - c_x)**2 + (y - c_y)**2) <= (r**2)

    matrix = np.zeros((h, w), dtype=np.uint8)
    # Map threshold: dark pixels = fail (or bright pixels if inverted)
    # Assuming dies in circle are 1 (normal) unless fail
    matrix[mask] = 1
    # Pixels significantly darker than average in wafer area marked as fail
    wafer_pixels = arr[mask]
    if len(wafer_pixels) > 0:
        mean_val = np.mean(wafer_pixels)
        fail_condition = (arr < mean_val * 0.6) | (arr > mean_val * 1.5)
        matrix[mask & fail_condition] = 2

    return inspect_wafer({
        "wafer_map": matrix.tolist(),
        "input_source": f"Image Upload ({file.filename})",
        "record_id": file.filename,
        "lot_name": "lot-uploaded",
        "wafer_index": 1
    })

@app.post("/api/compare")
def compare_wafers(payload: Dict[str, Any]):
    """
    Smart Comparison between Reference and Comparison Wafers.
    Calculates exact die count diffs, failure rate diffs, spatial IoU, pattern differences.
    """
    ref_map = payload.get("reference_map")
    cmp_map = payload.get("comparison_map")
    ref_id = payload.get("reference_id", "Ref")
    cmp_id = payload.get("comparison_id", "Cmp")

    if not ref_map or not cmp_map:
        raise HTTPException(status_code=400, detail="Both reference_map and comparison_map are required")

    ref_arr = np.array(ref_map, dtype=np.uint8)
    cmp_arr = np.array(cmp_map, dtype=np.uint8)

    # Handle shape alignment if different dimensions
    if ref_arr.shape != cmp_arr.shape:
        from scipy.ndimage import zoom
        zoom_factors = (ref_arr.shape[0] / cmp_arr.shape[0], ref_arr.shape[1] / cmp_arr.shape[1])
        cmp_arr = np.round(zoom(cmp_arr, zoom_factors, order=0)).astype(np.uint8)

    ref_spatial = analyze_wafer_spatial(ref_arr)
    cmp_spatial = analyze_wafer_spatial(cmp_arr)

    # Predictions
    ref_pred = model_service.predict(ref_arr)
    cmp_pred = model_service.predict(cmp_arr)

    # Difference map:
    # 0 = identical
    # 1 = reference only fail (healed in cmp)
    # 2 = comparison only fail (new defect in cmp)
    # 3 = both failed (persistent defect)
    diff_map = np.zeros_like(ref_arr, dtype=int)
    ref_fail = (ref_arr == 2)
    cmp_fail = (cmp_arr == 2)

    diff_map[ref_fail & ~cmp_fail] = 1
    diff_map[~ref_fail & cmp_fail] = 2
    diff_map[ref_fail & cmp_fail] = 3

    # Spatial Overlap / Jaccard IoU of failing dies
    intersection = np.sum(ref_fail & cmp_fail)
    union = np.sum(ref_fail | cmp_fail)
    spatial_iou = round(float(intersection / union), 4) if union > 0 else 1.0

    return {
        "reference": {
            "id": ref_id,
            "predicted_class": ref_pred["predicted_class"],
            "confidence": ref_pred["confidence"],
            "spatial_metrics": ref_spatial
        },
        "comparison": {
            "id": cmp_id,
            "predicted_class": cmp_pred["predicted_class"],
            "confidence": cmp_pred["confidence"],
            "spatial_metrics": cmp_spatial
        },
        "comparison_delta": {
            "failing_die_diff": cmp_spatial["failing_die_count"] - ref_spatial["failing_die_count"],
            "failure_rate_diff": round(cmp_spatial["failure_rate"] - ref_spatial["failure_rate"], 2),
            "yield_diff": round(cmp_spatial["yield_rate"] - ref_spatial["yield_rate"], 2),
            "spatial_iou": spatial_iou,
            "pattern_matched": (ref_pred["predicted_class"] == cmp_pred["predicted_class"]),
            "persistent_defect_count": int(intersection),
            "new_defect_count": int(np.sum(~ref_fail & cmp_fail)),
            "resolved_defect_count": int(np.sum(ref_fail & ~cmp_fail))
        },
        "difference_map": diff_map.tolist()
    }

@app.get("/api/forecast")
def get_forecast():
    return generate_prototype_lot_forecast()

@app.get("/api/batch-analytics")
def get_batch_analytics():
    """Aggregates lot-level wafer metrics and defect pattern occurrences."""
    samples = dataset_manager.samples
    lots = dataset_manager.lot_names
    
    lot_summaries = []
    class_totals = {c: 0 for c in PATTERN_CLASSES}

    for lot in lots:
        wafers = [s for s in samples if s.get("lot_name") == lot]
        if not wafers:
            continue
        lot_classes = {c: 0 for c in PATTERN_CLASSES}
        yields = []
        for w in wafers:
            lbl = w.get("original_label") or "unlabeled"
            if lbl in lot_classes:
                lot_classes[lbl] += 1
                class_totals[lbl] += 1
            matrix = np.array(w["wafer_map"], dtype=np.uint8)
            tot = np.sum(matrix > 0)
            fail = np.sum(matrix == 2)
            y_val = (1.0 - (fail / tot)) * 100.0 if tot > 0 else 100.0
            yields.append(y_val)

        lot_summaries.append({
            "lot_name": lot,
            "wafer_count": len(wafers),
            "mean_yield": round(float(np.mean(yields)), 2),
            "min_yield": round(float(np.min(yields)), 2),
            "max_yield": round(float(np.max(yields)), 2),
            "pattern_distribution": lot_classes
        })

    return {
        "total_lots": len(lot_summaries),
        "total_wafers_analyzed": len(samples),
        "lot_summaries": lot_summaries,
        "global_pattern_totals": class_totals
    }

@app.get("/api/history")
def get_inspection_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: str = Query(""),
    status: str = Query(""),
    category: str = Query("")
):
    return list_inspections(limit, offset, search, status, category)

@app.get("/api/history/{inspection_id}")
def get_inspection_by_id(inspection_id: str):
    record = get_inspection(inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection record not found")
    return record

@app.post("/api/reviews/{inspection_id}")
def submit_review(inspection_id: str, payload: Dict[str, Any]):
    decision = payload.get("decision", "confirmed")
    corrected = payload.get("corrected_category")
    notes = payload.get("notes")
    reviewer = payload.get("reviewer_id", "Quality Engineer")
    
    success = update_review(inspection_id, decision, corrected, notes, reviewer)
    return {"status": "success", "inspection_id": inspection_id, "decision": decision}

@app.post("/api/copilot")
def copilot_query(payload: Dict[str, Any]):
    query = payload.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return process_copilot_query(query)

@app.post("/api/synthetic/generate")
def generate_synthetic(payload: Dict[str, Any]):
    category = payload.get("category", "Center")
    size = payload.get("size", 38)
    matrix = dataset_manager.generate_pattern_array(category, size=size)
    spatial = analyze_wafer_spatial(matrix)
    pred = model_service.predict(matrix)
    
    return {
        "category": category,
        "size": size,
        "label": "DEMONSTRATION DATA — SYNTHETIC WAFER MAP",
        "wafer_map": matrix.tolist(),
        "spatial_metrics": spatial,
        "prediction": pred
    }

@app.get("/api/reports/pdf/{inspection_id}")
def download_pdf_report(inspection_id: str):
    record = get_inspection(inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection record not found")
    
    pdf_bytes = generate_pdf_report(record)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SEMI_NEX_AI_{inspection_id}.pdf"}
    )

@app.get("/api/reports/csv")
def download_csv_report():
    history = list_inspections(limit=1000)
    csv_str = export_inspections_to_csv(history["items"])
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=SEMI_NEX_AI_Inspections.csv"}
    )

@app.post("/api/model/train")
def train_model():
    """Triggers genuine model training on currently loaded dataset samples."""
    samples = dataset_manager.samples
    try:
        metadata = model_service.train_on_data(samples)
        return {
            "status": "success",
            "message": "Model trained and saved successfully.",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model/info")
def get_model_info():
    return {
        "is_loaded": model_service.is_loaded,
        "model_version": model_service.model_version,
        "metadata": model_service.metadata or {
            "status": "Trained model unavailable. Configure the WM-811K dataset and train or load a compatible model."
        }
    }
