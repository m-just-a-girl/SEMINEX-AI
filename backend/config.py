import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

# Ensure directories exist
for directory in [RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR, REPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Dataset configuration
RAW_DATASET_FILE = RAW_DATA_DIR / "LSWMD.pkl"
SAMPLE_DATASET_FILE = PROCESSED_DATA_DIR / "wm811k_samples.pkl"
DATABASE_PATH = BASE_DIR / "seminex.db"
MODEL_WEIGHTS_FILE = MODELS_DIR / "seminex_classifier.pkl"
MODEL_METADATA_FILE = MODELS_DIR / "model_metadata.json"

# Supported 9 defect categories as defined in WM-811K
PATTERN_CLASSES = [
    "none",
    "Center",
    "Donut",
    "Edge-Loc",
    "Edge-Ring",
    "Loc",
    "Random",
    "Near-full",
    "Scratch",
]

# Standard input size for ML pipeline
INPUT_SIZE = (52, 52)
