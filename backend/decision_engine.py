from typing import Dict, Any

def evaluate_decision_and_risk(
    predicted_class: str,
    confidence: float,
    failure_rate: float,
    total_dies: int,
    max_cluster_size: int,
    clusters: int
) -> Dict[str, Any]:
    """
    Evaluates evidence-based decision support and prototype risk scoring.
    Disclaimers:
    - 'Decision support only. Human review recommended for uncertain or consequential cases.'
    - 'Prototype Risk Scoring Framework: Not a certified failure probability.'
    """
    if total_dies < 15:
        return {
            "recommendation": "Insufficient Evidence",
            "recommendation_reason": "Total die count (< 15) is insufficient to compute a reliable spatial defect pattern.",
            "risk_score": 0.0,
            "risk_tier": "Undefined",
            "risk_formula": "Insufficient data to calculate score.",
            "factors": {}
        }

    # Defect severity weights based on semiconductor yield impact
    severity_weights = {
        "none": 0.05,
        "Random": 0.35,
        "Center": 0.70,
        "Edge-Loc": 0.75,
        "Edge-Ring": 0.80,
        "Donut": 0.85,
        "Loc": 0.85,
        "Scratch": 0.90,
        "Near-full": 1.00
    }
    sev_weight = severity_weights.get(predicted_class, 0.5)

    # 1. Failure rate component (0 - 40 points)
    # 0% failure -> 0 pts; >= 25% failure -> 40 pts
    fail_comp = min(40.0, (failure_rate / 25.0) * 40.0)

    # 2. Cluster density component (0 - 30 points)
    # Large contiguous clusters indicate localized equipment or physical damage
    cluster_ratio = (max_cluster_size / total_dies) if total_dies > 0 else 0
    cluster_comp = min(30.0, cluster_ratio * 100.0 * 0.3)

    # 3. Pattern severity component (0 - 20 points)
    pattern_comp = sev_weight * 20.0

    # 4. Model uncertainty component (0 - 10 points)
    # Lower confidence -> higher review priority
    uncertainty_comp = (1.0 - confidence) * 10.0

    # Total Risk Score (0 - 100)
    risk_score = round(fail_comp + cluster_comp + pattern_comp + uncertainty_comp, 1)

    # Recommendation determination
    if predicted_class == "none" and failure_rate < 2.0 and risk_score < 25.0:
        recommendation = "Low Concern"
        reason = "Nominal wafer profile with yield > 98% and no systematic spatial defect clusters."
        tier = "Low"
    elif risk_score >= 60.0 or failure_rate > 15.0 or predicted_class in ["Scratch", "Near-full", "Loc"]:
        recommendation = "Investigation Recommended"
        reason = (
            f"High-severity spatial signature '{predicted_class}' detected with "
            f"failure rate of {failure_rate}% and risk score of {risk_score}/100. "
            "Engineering review of manufacturing line parameters is advised."
        )
        tier = "High"
    else:
        recommendation = "Review Recommended"
        reason = (
            f"Moderate pattern risk ({risk_score}/100) or borderline classification confidence "
            f"({round(confidence*100, 1)}%). Secondary inspection verification recommended."
        )
        tier = "Moderate"

    return {
        "recommendation": recommendation,
        "recommendation_reason": reason,
        "risk_score": risk_score,
        "risk_tier": tier,
        "risk_framework": "Prototype Risk Scoring Framework",
        "formula_description": "Risk = FailRate_weight(40%) + ClusterDensity_weight(30%) + PatternSeverity_weight(20%) + Uncertainty_weight(10%)",
        "factors": {
            "failure_rate_points": round(fail_comp, 1),
            "cluster_density_points": round(cluster_comp, 1),
            "pattern_severity_points": round(pattern_comp, 1),
            "uncertainty_points": round(uncertainty_comp, 1)
        },
        "limitations": "Prototype score for triage prioritization only; not a validated physical failure probability."
    }
