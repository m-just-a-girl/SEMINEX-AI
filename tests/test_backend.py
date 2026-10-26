import uuid
import pytest
import numpy as np
from backend.config import PATTERN_CLASSES
from backend.dataset import dataset_manager
from backend.model_service import model_service
from backend.spatial_analysis import analyze_wafer_spatial
from backend.decision_engine import evaluate_decision_and_risk
from backend.root_cause import get_root_cause_hypothesis
from backend.report_generator import generate_pdf_report, export_inspections_to_csv
from backend.database import init_db, save_inspection, get_inspection, update_review

def test_dataset_manager():
    info = dataset_manager.get_dataset_info()
    assert "total_records" in info
    assert info["total_records"] > 0
    assert len(info["supported_classes"]) == 9
    assert "none" in info["supported_classes"]
    assert "Center" in info["supported_classes"]
    assert "Scratch" in info["supported_classes"]

def test_spatial_analysis():
    # Create 32x32 wafer matrix with a center defect
    matrix = dataset_manager.generate_pattern_array("Center", size=32)
    spatial = analyze_wafer_spatial(matrix)
    
    assert spatial["total_die_count"] > 0
    assert spatial["failing_die_count"] > 0
    assert spatial["failure_rate"] > 0.0
    assert spatial["radial_distribution"]["inner"] > 0.0
    assert spatial["clusters"] >= 1
    assert len(spatial["density_map"]) == 32

def test_model_prediction():
    matrix = dataset_manager.generate_pattern_array("Edge-Ring", size=32)
    prediction = model_service.predict(matrix)
    
    assert prediction["predicted_class"] in PATTERN_CLASSES
    assert 0.0 <= prediction["confidence"] <= 1.0
    assert len(prediction["class_scores"]) == 9
    assert prediction["model_mode"] in ["REAL MODEL INFERENCE", "PROTOTYPE AI INFERENCE"]
    assert len(prediction["explanation_map"]) == 32

def test_decision_support_and_risk():
    decision = evaluate_decision_and_risk(
        predicted_class="Scratch",
        confidence=0.88,
        failure_rate=12.5,
        total_dies=800,
        max_cluster_size=45,
        clusters=3
    )
    assert decision["recommendation"] in ["Low Concern", "Review Recommended", "Investigation Recommended"]
    assert 0.0 <= decision["risk_score"] <= 100.0
    assert "factors" in decision

def test_root_cause_hypotheses():
    for cls in PATTERN_CLASSES:
        hypo = get_root_cause_hypothesis(cls)
        assert "title" in hypo
        assert "investigation_directions" in hypo
        assert len(hypo["investigation_directions"]) > 0
        assert "disclaimer" in hypo

def test_pdf_report_generation():
    inspection_record = {
        "id": "INSP-TEST-001",
        "timestamp": "2026-10-23T10:00:00Z",
        "input_source": "WM-811K Dataset Record",
        "record_id": "W-0001",
        "lot_name": "lot42000",
        "wafer_index": 1,
        "original_label": "Center",
        "predicted_class": "Center",
        "confidence": 0.95,
        "model_version": "v1.2.0-spatial-gbc",
        "model_mode": "REAL MODEL INFERENCE",
        "failing_die_count": 85,
        "total_die_count": 912,
        "failure_rate": 9.32,
        "recommendation": "Review Recommended",
        "recommendation_reason": "Center defect cluster detected.",
        "hypothesis": "Center-Concentrated Process Anomaly",
        "review_status": "pending",
        "reviewer_notes": "Sample test note"
    }
    pdf_bytes = generate_pdf_report(inspection_record)
    assert pdf_bytes is not None
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

def test_database_persistence():
    init_db()
    test_id = f"INSP-UNITTEST-{uuid.uuid4().hex[:8]}"
    payload = {
        "id": test_id,
        "timestamp": "2026-10-23T10:00:00Z",
        "input_source": "Unit Test",
        "record_id": "UT-01",
        "lot_name": "lot-test",
        "wafer_index": 5,
        "original_label": "Loc",
        "predicted_class": "Loc",
        "confidence": 0.91,
        "class_scores": {"Loc": 0.91},
        "model_version": "v1.2.0",
        "model_mode": "REAL INFERENCE",
        "failing_die_count": 40,
        "total_die_count": 900,
        "failure_rate": 4.44,
        "recommendation": "Review Recommended",
        "recommendation_reason": "Localized cluster detected.",
        "hypothesis": "Localized Point Source Contamination",
        "review_status": "pending"
    }
    saved_id = save_inspection(payload)
    assert saved_id == test_id
    
    retrieved = get_inspection(test_id)
    assert retrieved is not None
    assert retrieved["id"] == test_id
    assert retrieved["predicted_class"] == "Loc"
    
    # Update review
    update_review(test_id, decision="confirmed", notes="Verified by test suite.")
    updated = get_inspection(test_id)
    assert updated["review_status"] == "confirmed"
    assert updated["reviewer_notes"] == "Verified by test suite."
