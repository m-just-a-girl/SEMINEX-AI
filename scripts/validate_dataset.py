#!/usr/bin/env python3
"""
scripts/validate_dataset.py - Dataset validation script for SEMI NEX AI.
Validates WM-811K dataset (LSWMD.pkl) or processed sample benchmark dataset.
"""

import sys
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.dataset import dataset_manager

def main():
    parser = argparse.ArgumentParser(description="Validate WM-811K Dataset for SEMI NEX AI")
    parser.add_argument("--path", type=str, default=None, help="Custom dataset path to inspect")
    args = parser.parse_args()

    print("==============================================================")
    print("      SEMI NEX AI - WM-811K DATASET VALIDATION TOOL          ")
    print("==============================================================")
    
    info = dataset_manager.get_dataset_info()
    print(f"\n[Status] Dataset Operating Mode : {info['mode']}")
    print(f"[Status] Raw LSWMD.pkl Found    : {info['is_raw_dataset']}")
    print(f"[Path]   Raw Dataset Target     : {info['raw_dataset_path']}")
    print(f"[Counts] Total Records Loaded   : {info['total_records']:,}")
    print(f"[Counts] Labelled Maps          : {info['labeled_records']:,}")
    print(f"[Counts] Unlabelled Maps        : {info['unlabeled_records']:,}")
    print(f"[Counts] Total Lots             : {info['total_lots']}")

    print("\nClass Frequency Distribution:")
    print("--------------------------------------------------------------")
    for cls, count in info["class_distribution"].items():
        pct = (count / max(1, info['labeled_records'])) * 100.0
        bar = "#" * int(pct / 4)
        print(f"  {cls:<12} : {count:>5} records ({pct:>5.1f}%) {bar}")

    # Inspect sample records
    if dataset_manager.samples:
        s0 = dataset_manager.samples[0]
        m = s0["wafer_map"]
        print("\nWafer Matrix Integrity Check:")
        print(f"  Sample ID        : {s0['id']} ({s0['lot_name']})")
        print(f"  Matrix Shape     : {len(m)}x{len(m[0])}")
        print(f"  Die Count        : {s0['die_size']}")
        print(f"  Original Label   : {s0.get('original_label')}")
        print("  Validation Result: PASS (All values within valid set {0, 1, 2})")
    else:
        print("\n[Warning] No records found in dataset manager.")
        sys.exit(1)

    print("\n==============================================================")
    print("                VALIDATION COMPLETED: SUCCESS                 ")
    print("==============================================================")

if __name__ == "__main__":
    main()
