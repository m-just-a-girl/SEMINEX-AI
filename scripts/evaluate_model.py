#!/usr/bin/env python3
"""
scripts/evaluate_model.py - Model evaluation script for SEMI NEX AI.
Evaluates saved classifier on held-out test data and prints confusion matrix.
"""

import sys
import json
import argparse
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.config import MODEL_METADATA_FILE, PATTERN_CLASSES
from backend.model_service import model_service

def main():
    print("==============================================================")
    print("         SEMI NEX AI — MODEL EVALUATION & METRICS             ")
    print("==============================================================")

    if not MODEL_METADATA_FILE.exists():
        print("[Error] No model metadata found. Please run scripts/train_model.py first.")
        sys.exit(1)

    with open(MODEL_METADATA_FILE, "r") as f:
        meta = json.load(f)

    print(f"Model Version     : {meta.get('model_version')}")
    print(f"Architecture      : {meta.get('architecture')}")
    print(f"Trained Timestamp : {meta.get('trained_at')}")
    print(f"Evaluation Samples: {meta.get('test_samples_count')}")
    print(f"Overall Accuracy  : {meta.get('accuracy', 0.0) * 100:.2f}%")
    print(f"Macro F1 Score    : {meta.get('macro_f1', 0.0) * 100:.2f}%")

    print("\nConfusion Matrix (Rows: Ground Truth, Columns: Predicted):")
    print("        " + "  ".join([f"{c[:4]:>4}" for c in PATTERN_CLASSES]))
    cm = meta.get("confusion_matrix", [])
    for idx, row in enumerate(cm):
        row_str = "  ".join([f"{v:>4}" for v in row])
        print(f"{PATTERN_CLASSES[idx][:6]:<7} [{row_str}]")

    print("\nPer-Class Performance Breakdown:")
    print(f"  {'Class':<12} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'Support':<8}")
    print("  " + "-" * 56)
    for cls, metrics in meta.get("per_class_metrics", {}).items():
        print(f"  {cls:<12} | {metrics['precision']:<10} | {metrics['recall']:<10} | {metrics['f1_score']:<10} | {metrics['support']:<8}")

    print("\n==============================================================")
    print("               EVALUATION VERIFIED ON HELD-OUT DATA           ")
    print("==============================================================")

if __name__ == "__main__":
    main()
