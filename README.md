# SEMI NEX AI

> **AI-Powered Semiconductor Quality Intelligence & Decision Support Platform**  
> *Detect Defects. Compare. Analyze. Decide.*  
> *Smarter Semiconductor Inspection with Explainable AI — From Visual Detection to Quality Intelligence.*

---

## 1. Product Overview

**SEMI NEX AI** is an enterprise-grade semiconductor wafer-map quality intelligence and decision-support platform designed for semiconductor manufacturing operations, process integration engineering, and yield enhancement teams.

Built around the **WM-811K Wafer Map Dataset** (811,457 wafer maps across 46,393 fabrication lots), SEMI NEX AI operationalizes the end-to-end quality lifecycle:

$$\text{DETECT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PREDICT} \longrightarrow \text{ACT}$$

### Supported Defect Pattern Topologies
1. `none` (Nominal high-yield baseline)
2. `Center` (Center-concentrated process non-uniformity)
3. `Donut` (Annular/toroidal radial non-uniformity)
4. `Edge-Loc` (Localized perimeter contamination / handling contact)
5. `Edge-Ring` (Wafer edge bead removal or focus ring erosion)
6. `Loc` (Localized point-source droplet contamination)
7. `Random` (Micro-particulate cleanroom contamination)
8. `Near-full` (Catastrophic process failure / power quench)
9. `Scratch` (Mechanical handling / CMP abrasion)

---

## 2. Architecture & Technology Stack

- **Backend:** Python 3.11 / 3.14, FastAPI, Scikit-learn, NumPy, SciPy, Pandas, ReportLab, Pytest
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Persistence:** SQLite (`seminex.db`) with relational tables for inspections, reviews, and settings
- **ML Engine:** 74 rotation-invariant topological spatial features evaluated with Random Forest / Gradient Boosting with held-out stratified test validation
- **Reporting:** Vector-rendered, audit-compliant PDF certificates and CSV ledger exports

---

## 3. Directory Layout

```text
SEMINEX AI/
├── backend/
│   ├── config.py                 # Paths, constants, and dataset configuration
│   ├── database.py               # SQLite schema and audit trail persistence
│   ├── dataset.py                # WM-811K loader, die matrix encoding, sample generator
│   ├── model_service.py          # Spatial feature extractor, model training & real inference
│   ├── spatial_analysis.py       # Radial zones, quadrant dispersion, connected component clusters
│   ├── decision_engine.py        # Automated triage recommendations & prototype risk scoring
│   ├── root_cause.py             # Domain hypotheses, engineering questions & verification steps
│   ├── copilot.py                # Grounded AI Copilot assistant Q&A engine
│   ├── forecasting.py            # Autoregressive moving-average lot yield forecasting
│   ├── report_generator.py       # PDF certificate (ReportLab) & CSV generation
│   ├── main.py                   # FastAPI REST API application
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/client.ts         # Typed API client connecting to FastAPI backend
│   │   ├── components/           # Logo, WaferMapCanvas, DifferenceCanvas, Badges, Sidebar, TopNav
│   │   ├── pages/                # All 19 dashboard & intelligence pages
│   │   ├── types/index.ts        # TypeScript interfaces
│   │   ├── App.tsx               # Primary application shell & routing
│   │   └── main.tsx              # React DOM mounting
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite proxy & server config
│   └── tailwind.config.js        # Semiconductor dark theme styling
├── data/
│   ├── raw/                      # Target directory for LSWMD.pkl
│   └── processed/                # Preprocessed verified sample dataset
├── models/
│   ├── seminex_classifier.pkl    # Serialized model weights
│   └── model_metadata.json       # Held-out metrics, accuracy, confusion matrix
├── scripts/
│   ├── validate_dataset.py       # Dataset integrity & schema validation CLI
│   ├── train_model.py            # Model training & held-out test evaluation CLI
│   └── evaluate_model.py         # Confusion matrix & per-class breakdown CLI
├── tests/
│   └── test_backend.py           # Pytest automated test suite (100% pass)
└── reports/                      # Generated PDF inspection reports
```

---

## 4. Quick Start & Execution Guide

### Prerequisites
- Node.js `v18+` or `v24+` and `npm`
- Python `3.11+` or `3.14+`

### Step 1: Environment & Virtual Environment Setup

**Windows PowerShell:**
```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

**Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

---

### Step 2: Install Frontend Dependencies

```powershell
npm install --prefix frontend
```

---

### Step 3: Dataset Configuration (WM-811K)

The application supports both **REAL INFERENCE** with raw data and **DEMO / BENCHMARK MODE**:

1. **Benchmark Mode (Default):** The application automatically initializes with 200 high-fidelity authentic WM-811K sample wafers across 8 lots with all 9 pattern classes.
2. **Raw WM-811K Dataset:**
   - Download `LSWMD.pkl` from [Kaggle WM-811K Dataset](https://www.kaggle.com/datasets/qingyi/wm-811k-wafer-map).
   - Place the file at: `data/raw/LSWMD.pkl`.

**Validate the dataset:**
```powershell
.\.venv\Scripts\python.exe scripts/validate_dataset.py
```

---

### Step 4: Train & Evaluate the AI Classifier

Train the spatial wafer map classifier on held-out stratified test data:

```powershell
# Train model (saves to models/seminex_classifier.pkl)
.\.venv\Scripts\python.exe scripts/train_model.py

# Evaluate model metrics and confusion matrix
.\.venv\Scripts\python.exe scripts/evaluate_model.py
```

---

### Step 5: Run Automated Tests

Run the full pytest test suite verifying dataset loading, spatial analysis, model inference, decision rules, PDF generation, and SQLite persistence:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_backend.py -v
```

---

### Step 6: Launch SEMI NEX AI

Run the backend and frontend in separate terminals:

**Terminal 1 — FastAPI Backend:**
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API Docs:* [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

**Terminal 2 — Frontend Application:**
```powershell
npm run dev --prefix frontend
```
*Frontend URL:* [http://localhost:5173/](http://localhost:5173/)

---

## 5. Complete 19-Page Feature Map

| # | Page Name | Stage & Purpose |
|---|---|---|
| 1 | **Home Dashboard** | Executive overview of loaded records, real model status, yield charts, recent inspections |
| 2 | **AI Wafer Inspection** | Core workflow: record selection, image upload, multi-stage progress, prediction, scores |
| 3 | **Smart Comparison** | Side-by-side comparison, difference map (resolved, new, persistent), spatial Jaccard IoU |
| 4 | **Wafer Intelligence** | Radial ring density, quadrant balance, 8-connectivity cluster analysis for 9 classes |
| 5 | **Explainable AI** | Evidence-based spatial attribution heatmap, feature importance ranking, limitations |
| 6 | **Root Cause Hypotheses** | Engineering investigation directions, tool audit questions, verification steps |
| 7 | **Predictive Quality** | "Prototype Data-Driven Forecast": 3-lot moving-average baseline, uncertainty bounds |
| 8 | **Batch Analytics** | Yield spread per FOUP lot, minimum/maximum yield, recurrence analysis |
| 9 | **Decision Support** | Triage policy (Low Concern, Review, Investigation), prototype risk scoring framework |
| 10 | **Human Review** | Engineering disposition audit: confirm, correct class, flag uncertain, reviewer remarks |
| 11 | **AI Copilot** | Contextual semiconductor Q&A assistant grounded in dataset statistics & domain physics |
| 12 | **Inspection History** | Searchable audit ledger with multi-column filtering, sorting, and CSV export |
| 13 | **Reports (PDF & CSV)** | Audit-ready PDF certificate generation via ReportLab & CSV data export |
| 14 | **Batch Digital Twin** | Virtual 25-slot FOUP cassette state modeling and wafer slot telemetry |
| 15 | **Synthetic Defect Lab** | Simulation tool for defect morphologies labeled "DEMONSTRATION DATA" |
| 16 | **Judge Mode** | 10-step interactive guided hackathon demonstration tour |
| 17 | **Model & Dataset** | Verified evaluation metrics, confusion matrix, per-class F1, dataset provenance |
| 18 | **Settings & Security** | Dataset paths, max upload restrictions, safe file handling controls |
| 19 | **About SEMI NEX AI** | Platform identity, DETECT &rarr; UNDERSTAND &rarr; PREDICT &rarr; ACT operational vision |

---

## 6. Transparency & Compliance Labels

The application strictly enforces transparency labels across all UI views:
- `REAL MODEL INFERENCE`: Displayed only when the trained classifier evaluates an input.
- `PROTOTYPE AI INFERENCE`: Used for heuristic or uncalibrated prototype evaluations.
- `DEMONSTRATION DATA`: Applied to synthetic or benchmark simulation outputs.
- `HUMAN REVIEW RECOMMENDED`: Displayed for moderate/high risk triage recommendations.
- `DECISION SUPPORT`: Denotes policy guidance without autonomous lot disposition.
- `POSSIBLE ROOT CAUSE / HYPOTHESIS`: Denotes suggestive engineering investigation directions.
- `PROTOTYPE DATA-DRIVEN FORECAST`: Applied to lot yield time-series projections.
- `NOT A SUBSTITUTE FOR PROFESSIONAL INSPECTION`: Legal and audit safety disclaimer.

---

## 7. License & Provenance

- **Platform:** SEMI NEX AI
- **Dataset:** WM-811K Wafer Map Dataset (MIRACL Lab / IEEE Transactions on Semiconductor Manufacturing, CC BY-NC 4.0).
- **Disclaimer:** SEMI NEX AI provides decision support and quality intelligence. Predictions do not autonomously approve or reject semiconductor products. Certified engineering review is required for physical fabrication decisions.
