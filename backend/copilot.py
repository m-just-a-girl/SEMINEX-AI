import re
from typing import Dict, Any, List
from backend.dataset import dataset_manager
from backend.model_service import model_service
from backend.database import list_inspections
from backend.root_cause import ROOT_CAUSE_KNOWLEDGE_BASE

def process_copilot_query(query: str) -> Dict[str, Any]:
    """
    Semiconductor Quality AI Copilot.
    Answers queries grounded in actual application data, dataset statistics, and model metadata.
    """
    q = query.lower().strip()
    dataset_info = dataset_manager.get_dataset_info()
    history = list_inspections(limit=10)
    
    # 1. Dataset questions: "most common", "how many labeled", "distribution", "records"
    if "most common" in q or "highest frequency" in q:
        dist = dataset_info["class_distribution"]
        if dist:
            sorted_classes = sorted(dist.items(), key=lambda x: x[1], reverse=True)
            top_class, top_count = sorted_classes[0]
            answer = (
                f"Based on the currently loaded dataset ({dataset_info['mode']}), the most frequent "
                f"labelled pattern is **{top_class}** with **{top_count:,}** records "
                f"({round(top_count / max(1, dataset_info['labeled_records']) * 100, 1)}% of labelled maps). "
                f"Total records in system: {dataset_info['total_records']:,}."
            )
        else:
            answer = "No dataset records are currently loaded."
        return {
            "answer": answer,
            "category": "Dataset Statistics",
            "source": f"Dataset Manager ({dataset_info['mode']})"
        }

    if "how many" in q or "records" in q or "count" in q or "labeled" in q:
        answer = (
            f"**Dataset Summary ({dataset_info['mode']}):**\n"
            f"- **Total Records:** {dataset_info['total_records']:,}\n"
            f"- **Labelled Maps:** {dataset_info['labeled_records']:,}\n"
            f"- **Unlabelled Maps:** {dataset_info['unlabeled_records']:,}\n"
            f"- **Total Lots:** {dataset_info['total_lots']}\n"
            f"- **Data Provenance:** {dataset_info['provenance']}\n"
            f"- **Storage Path:** `{dataset_info['raw_dataset_path']}`"
        )
        return {
            "answer": answer,
            "category": "Dataset Inventory",
            "source": "WM-811K Dataset Manager"
        }

    # 2. Pattern definition questions: "edge-ring", "center", "donut", "scratch", etc.
    for pattern_name in ROOT_CAUSE_KNOWLEDGE_BASE.keys():
        if pattern_name.lower() in q:
            info = ROOT_CAUSE_KNOWLEDGE_BASE[pattern_name]
            answer = (
                f"### Pattern Intelligence: **{pattern_name}**\n\n"
                f"**Spatial Signature:** {info['spatial_evidence']}\n\n"
                f"**Potential Process Anomaly:** {info['title']}\n\n"
                f"**Engineering Investigation Directions:**\n" +
                "\n".join([f"- {d}" for d in info["investigation_directions"]]) +
                f"\n\n**Suggested Verification Steps:**\n" +
                "\n".join([f"- {v}" for v in info["verification_steps"]]) +
                f"\n\n> ⚠️ *{info['disclaimer']}*"
            )
            return {
                "answer": answer,
                "category": "Defect Pattern Physics",
                "source": "Semiconductor Quality Domain Knowledge Base"
            }

    # 3. Difference between Center and Donut
    if "difference between" in q or ("center" in q and "donut" in q):
        answer = (
            "### Comparison: Center vs. Donut Defect Patterns\n\n"
            "| Characteristic | **Center Pattern** | **Donut Pattern** |\n"
            "|---|---|---|\n"
            "| **Spatial Distribution** | Defect core concentrated within inner 35% of wafer radius (r < 0.35 R). | Annular ring in middle zone (0.35 R < r < 0.75 R); center dies remain passing. |\n"
            "| **Physical Mechanism** | Central hot-spot, wafer chuck center cooling degradation, or spin-coat puddle defect. | Radial plasma non-uniformity, CMP multi-zone carrier pressure mismatch, or annular gas dispersion. |\n"
            "| **Inspection Action** | Audit electrostatic chuck (ESC) backside helium pressure map. | Inspect plasma chamber showerhead radial flow ratios and CMP retaining ring condition. |\n\n"
            "> ⚠️ *Professional verification required.*"
        )
        return {
            "answer": answer,
            "category": "Pattern Comparison",
            "source": "Domain Knowledge Base"
        }

    # 4. Human review questions
    if "human review" in q or "review" in q or "require review" in q:
        pending_count = sum(1 for item in history["items"] if item.get("review_status") == "pending")
        answer = (
            f"Currently, there are **{pending_count}** recent inspections in the pending review queue.\n\n"
            "**Human Review is recommended when:**\n"
            "1. Model confidence is below 80% or multiple classes have similar probabilities.\n"
            "2. High-severity spatial signatures are detected (e.g. `Scratch`, `Loc`, `Near-full`).\n"
            "3. Calculated wafer failure rate exceeds 15%.\n"
            "4. A new process recipe or tool chamber was recently serviced."
        )
        return {
            "answer": answer,
            "category": "Human Review Triage",
            "source": "SEMI NEX AI Decision Support Engine"
        }

    # 5. Limitations
    if "limitation" in q or "accuracy" in q or "reliability" in q:
        meta = model_service.metadata or {}
        acc = meta.get("accuracy", "N/A")
        if isinstance(acc, float):
            acc_str = f"{acc * 100:.2f}%"
        else:
            acc_str = str(acc)
        answer = (
            f"### Model Limitations & Transparency Notice\n\n"
            f"- **Model Version:** {model_service.model_version} (Current Mode: {model_service.metadata.get('architecture', 'RandomForest Wafer Spatial Classifier') if model_service.metadata else 'PROTOTYPE AI INFERENCE'})\n"
            f"- **Validation Accuracy:** {acc_str} on held-out test data.\n"
            f"- **Topological Scope:** Predictions are derived from 2D spatial die pass/fail arrays. The model does not measure film thickness, electrical resistance, or chemical composition.\n"
            f"- **Root Cause Boundary:** Spatial hypotheses suggest investigation directions for equipment engineers. They do not constitute autonomous or legally binding tool diagnoses."
        )
        return {
            "answer": answer,
            "category": "System Limitations",
            "source": "Model Transparency & Governance Policy"
        }

    # Default fallback grounded response
    return {
        "answer": (
            f"I can assist with questions regarding SEMI NEX AI, the WM-811K wafer dataset, pattern characteristics "
            f"(`Center`, `Donut`, `Edge-Ring`, `Edge-Loc`, `Loc`, `Random`, `Scratch`, `Near-full`, `none`), "
            f"model performance metrics, human review status, or root cause investigation directions.\n\n"
            f"**Quick Prompts:**\n"
            f"- *'Which pattern is most common in the dataset?'*\n"
            f"- *'What causes an Edge-Ring pattern?'*\n"
            f"- *'What is the difference between Center and Donut?'*\n"
            f"- *'What are the limitations of this prediction?'*"
        ),
        "category": "General Help",
        "source": "AI Copilot Assistant"
    }
