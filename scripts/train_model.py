#!/usr/bin/env python3
"""
scripts/train_model.py - Model training script for SEMI NEX AI.
Trains Random Forest spatial classifier on labeled WM-811K wafer maps.
"""

import sys
import argparse
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.dataset import dataset_manager
from backend.model_service import model_service

def main():
    parser = argparse.ArgumentParser(description="Train SEMI NEX AI Wafer Map Model")
    parser.add_argument("--test-size", type=float, default=0.25, help="Test set split fraction")
    args = parser.parse_args()

    print("==============================================================")
    print("        SEMI NEX AI — WAFER MAP MODEL TRAINING PIPELINE       ")
    print("==============================================================")
    
    samples = dataset_manager.samples
    print(f"Loaded {len(samples)} total wafer records.")
    
    try:
        metadata = model_service.train_on_data(samples, test_size=args.test_size)
    except Exception as e:
        print(f"[Error] Training failed: {e}")
        sys.exit(1)

    print("\n---------------- Training Results ----------------")
    print(f"Model Architecture: {metadata['architecture']}")
    print(f"Model Version     : {metadata['model_version']}")
    print(f"Train Set Size    : {metadata['train_samples_count']}")
    print(f"Held-out Test Size: {metadata['test_samples_count']}")
    print(f"Test Accuracy     : {metadata['accuracy'] * 100:.2f}%")
    print(f"Macro F1-Score    : {metadata['macro_f1'] * 100:.2f}%")

    print("\nPer-Class Performance Metrics:")
    print(f"  {'Class':<12} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'Support':<8}")
    print("  " + "-" * 56)
    for cls, metrics in metadata["per_class_metrics"].items():
        print(f"  {cls:<12} | {metrics['precision']:<10} | {metrics['recall']:<10} | {metrics['f1_score']:<10} | {metrics['support']:<8}")

    print("\nWeights saved to  : models/seminex_classifier.pkl")
    print("Metadata saved to : models/model_metadata.json")
    print("==============================================================")
    print("              MODEL TRAINING COMPLETED SUCCESSFULLY           ")
    print("==============================================================")

if __name__ == "__main__":
    main()
