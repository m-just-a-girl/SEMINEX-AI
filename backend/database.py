import sqlite3
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.config import DATABASE_PATH

def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        input_source TEXT NOT NULL,
        record_id TEXT,
        lot_name TEXT,
        wafer_index INTEGER,
        original_label TEXT,
        predicted_class TEXT NOT NULL,
        confidence REAL NOT NULL,
        class_scores_json TEXT,
        model_version TEXT NOT NULL,
        model_mode TEXT NOT NULL,
        failing_die_count INTEGER NOT NULL,
        total_die_count INTEGER NOT NULL,
        failure_rate REAL NOT NULL,
        recommendation TEXT NOT NULL,
        recommendation_reason TEXT,
        hypothesis TEXT,
        review_status TEXT DEFAULT 'pending',
        reviewed_category TEXT,
        reviewer_notes TEXT,
        reviewed_at TEXT,
        wafer_map_json TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inspection_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        decision TEXT NOT NULL,
        corrected_category TEXT,
        reviewer_id TEXT,
        reviewer_notes TEXT,
        FOREIGN KEY(inspection_id) REFERENCES inspections(id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

def save_inspection(data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO inspections (
        id, timestamp, input_source, record_id, lot_name, wafer_index,
        original_label, predicted_class, confidence, class_scores_json,
        model_version, model_mode, failing_die_count, total_die_count,
        failure_rate, recommendation, recommendation_reason, hypothesis,
        review_status, reviewed_category, reviewer_notes, reviewed_at, wafer_map_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["id"],
        data.get("timestamp", datetime.now(timezone.utc).isoformat()),
        data.get("input_source", "Unknown"),
        data.get("record_id"),
        data.get("lot_name"),
        data.get("wafer_index"),
        data.get("original_label"),
        data["predicted_class"],
        data.get("confidence", 0.0),
        json.dumps(data.get("class_scores", {})),
        data.get("model_version", "v1.0.0"),
        data.get("model_mode", "PROTOTYPE AI INFERENCE"),
        data.get("failing_die_count", 0),
        data.get("total_die_count", 0),
        data.get("failure_rate", 0.0),
        data.get("recommendation", "Review Recommended"),
        data.get("recommendation_reason", ""),
        data.get("hypothesis", ""),
        data.get("review_status", "pending"),
        data.get("reviewed_category"),
        data.get("reviewer_notes"),
        data.get("reviewed_at"),
        json.dumps(data.get("wafer_map", [])) if "wafer_map" in data else None
    ))
    conn.commit()
    conn.close()
    return data["id"]

def get_inspection(inspection_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    if d.get("class_scores_json"):
        try:
            d["class_scores"] = json.loads(d["class_scores_json"])
        except Exception:
            d["class_scores"] = {}
    if d.get("wafer_map_json"):
        try:
            d["wafer_map"] = json.loads(d["wafer_map_json"])
        except Exception:
            d["wafer_map"] = []
    return d

def list_inspections(limit: Optional[int] = 50, offset: int = 0, search: str = "", status: str = "", category: str = "") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM inspections WHERE 1=1"
    params = []
    if search:
        query += " AND (id LIKE ? OR record_id LIKE ? OR lot_name LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
    if status:
        query += " AND review_status = ?"
        params.append(status)
    if category:
        query += " AND predicted_class = ?"
        params.append(category)

    count_query = query.replace("SELECT *", "SELECT COUNT(*)", 1)
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]

    query += " ORDER BY timestamp DESC"
    if limit is not None:
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        d = dict(r)
        d.pop("wafer_map_json", None)  # exclude heavy array from listing
        if d.get("class_scores_json"):
            try:
                d["class_scores"] = json.loads(d["class_scores_json"])
            except Exception:
                d["class_scores"] = {}
        items.append(d)
    return {"total": total, "items": items, "limit": limit, "offset": offset}

def update_review(inspection_id: str, decision: str, corrected_category: Optional[str] = None, notes: Optional[str] = None, reviewer_id: str = "Quality Engineer") -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM inspections WHERE id = ?", (inspection_id,))
    if not cursor.fetchone():
        conn.close()
        return False

    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    UPDATE inspections
    SET review_status = ?, reviewed_category = ?, reviewer_notes = ?, reviewed_at = ?
    WHERE id = ?
    """, (decision, corrected_category, notes, now, inspection_id))

    cursor.execute("""
    INSERT INTO reviews (inspection_id, timestamp, decision, corrected_category, reviewer_id, reviewer_notes)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (inspection_id, now, decision, corrected_category, reviewer_id, notes))

    conn.commit()
    conn.close()
    return True
    conn.close()
    return True
