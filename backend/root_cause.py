from typing import Dict, Any, List

ROOT_CAUSE_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "Center": {
        "title": "Center-Concentrated Process Anomaly",
        "spatial_evidence": "Failure density localized in inner core (r < 0.35 R) with radial symmetry.",
        "investigation_directions": [
            "Inspect wafer chuck temperature distribution and helium backside cooling uniformity.",
            "Verify central gas delivery showerhead or chemical dispense nozzle flow rate.",
            "Review CMP polishing pad center-to-edge pressure profile and conditioning diamond disk wear.",
            "Check spin-coat photoresist dispense volume and puddle formation dynamics."
        ],
        "engineer_questions": [
            "Was there an electrostatic chuck (ESC) temperature fluctuation during plasma etch?",
            "Are other wafers processed in chamber position A showing similar center defect signatures?",
            "When was the central gas showerhead last inspected for particulate buildup or orifice clogging?"
        ],
        "verification_steps": [
            "Measure Chuck Thermal Map using a thermal sensor test wafer.",
            "Inspect physical wafer surface via CD-SEM or optical profilometry at coordinate center.",
            "Cross-reference lot process chamber logs for recipe step duration and gas flow stability."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Donut": {
        "title": "Annular / Toroidal Distribution Anomaly",
        "spatial_evidence": "Defects concentrated in mid-radius annular band (0.35 R < r < 0.75 R) with inner and outer zones relatively clear.",
        "investigation_directions": [
            "Investigate plasma chamber radial gas dispersion and RF coil uniformity.",
            "Examine chemical mechanical planarization (CMP) multi-zone carrier pressure differentials.",
            "Inspect rapid thermal anneal (RTA) lamp zone bank heating ratios."
        ],
        "engineer_questions": [
            "Does the mid-zone gas flow ratio match the certified chamber baseline?",
            "Is the CMP retaining ring pressure causing stress deformation at the mid-wafer transition?"
        ],
        "verification_steps": [
            "Run 49-point four-point probe sheet resistance measurement across wafer diameter.",
            "Review RTA pyrometer sensor calibration across concentric heating zones."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Edge-Ring": {
        "title": "Wafer Perimeter / Edge Exclusion Issue",
        "spatial_evidence": "High defect density concentrated around outer perimeter (r > 0.80 R) with circular continuity.",
        "investigation_directions": [
            "Review edge bead removal (EBR) solvent dispense alignment and spin-dry velocity.",
            "Inspect clamp ring or electrostatic chuck focus ring erosion and edge clearance.",
            "Check wafer bevel and edge polish parameters for slurry redeposition."
        ],
        "engineer_questions": [
            "Has the chamber focus ring exceeded its preventive maintenance (PM) RF hours?",
            "Is edge bead rinse solvent splashing back onto active outer die areas?",
            "Were there wafer handling bevel contact alarms during vacuum transfer?"
        ],
        "verification_steps": [
            "Measure focus ring height and surface erosion profile using optical micrometer.",
            "Check edge exclusion recipe zone limit (typically 1.5mm - 3.0mm bevel margin).",
            "Perform bevel SEM inspection for film peeling or particulate flakes."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Edge-Loc": {
        "title": "Localized Perimeter Contamination or Handling Contact",
        "spatial_evidence": "Cluster of failing dies isolated on outer edge within a specific angular arc.",
        "investigation_directions": [
            "Check robot end-effector / vacuum wand contact points and grip force.",
            "Examine cassette / FOUP slot pitch and potential wafer edge rubbing during loading.",
            "Inspect edge exhaust port for localized air turbulence or gas stagnation."
        ],
        "engineer_questions": [
            "Does the angular position correlate with the notch / flat orientation or robot paddle angle?",
            "Are consecutive slot positions in the same FOUP cassette showing defects at this angle?"
        ],
        "verification_steps": [
            "Review robotic transfer unit (EFEM) coordinate calibration and teaching positions.",
            "Inspect FOUP cassette teeth for mechanical scratching or plastic particle shedding."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Loc": {
        "title": "Localized Point Source / Droplet Contamination",
        "spatial_evidence": "Compact, dense cluster of failing dies bounded to a specific internal wafer quadrant.",
        "investigation_directions": [
            "Investigate chemical dispense nozzle drip or condensation fall from upper chamber walls.",
            "Examine localized thermal hot-spots or optical lithography reticle field contamination.",
            "Check for particulate shedding from upper vacuum valve or slit door seals."
        ],
        "engineer_questions": [
            "Is the cluster stationary across wafers in the lot (indicating reticle / optical mask defect)?",
            "Was there an uncommanded pressure spike or purge cycle in the deposition chamber?"
        ],
        "verification_steps": [
            "Verify reticle barcode and conduct automated reticle inspection (ARI).",
            "Analyze elemental composition of defect particles via Energy Dispersive X-ray Spectroscopy (EDS)."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Scratch": {
        "title": "Mechanical Abrasion / Physical Contact Defect",
        "spatial_evidence": "Linear or arcuate path of defective dies cutting across contiguous die fields.",
        "investigation_directions": [
            "Inspect automated wafer handler Bernoulli wand, vacuum chuck pins, and edge grippers.",
            "Examine CMP polishing pad condition for embedded foreign particles or diamond grit shedding.",
            "Check manual handling tools (tweezers, inspection wands) if manual transfer occurred."
        ],
        "engineer_questions": [
            "Does the scratch trajectory match the sweep path of CMP conditioning arms or transfer arms?",
            "Did particle counters spike during pre-aligner or wafer transfer sequences?"
        ],
        "verification_steps": [
            "Measure scratch depth and die layer penetration using Atomic Force Microscopy (AFM).",
            "Inspect CMP pad surface using high-resolution optical inspection for embedded contaminants."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Random": {
        "title": "Background Particulate / Micro-Contamination",
        "spatial_evidence": "Uniformly dispersed failing dies lacking spatial clustering or radial bias.",
        "investigation_directions": [
            "Inspect cleanroom airborne particulate levels (ISO class compliance).",
            "Check chemical purity in wet clean baths (UPW resistivity, particle count per mL).",
            "Verify raw silicon substrate starting wafer defect density (crystal originated pits / COPs)."
        ],
        "engineer_questions": [
            "Have cleanroom particle monitoring sensors flagged filtration or laminar flow disruptions?",
            "Are incoming bare silicon wafer certificates of analysis within COP specification?"
        ],
        "verification_steps": [
            "Review in-line laser particle scanner (e.g. KLA-Tencor Surfscan) haze and defect maps.",
            "Conduct UPW filtration system TOC and bacterial analysis."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "Near-full": {
        "title": "Catastrophic Process Failure / Systemic Breakdown",
        "spatial_evidence": "Massive failure spanning vast majority of active dies (> 75% yield loss).",
        "investigation_directions": [
            "Check major recipe misconfiguration (wrong lithography mask, gross over/under-exposure).",
            "Inspect vacuum loss, gas line runout, or power failure during critical film deposition.",
            "Verify etch endpoint failure resulting in complete layer punch-through."
        ],
        "engineer_questions": [
            "Did the tool experience an abort or EMO (emergency power off) event during processing?",
            "Was a non-qualified developmental recipe inadvertently loaded for this wafer?"
        ],
        "verification_steps": [
            "Audit tool alarm and event trace log for plasma quench or interlock trips.",
            "Perform cross-sectional SEM to verify layer presence and film thickness."
        ],
        "disclaimer": "Professional verification required. Wafer map patterns alone do not prove equipment or physical root causes."
    },
    "none": {
        "title": "Nominal Manufacturing Baseline",
        "spatial_evidence": "Normal die distribution with yield exceeding baseline threshold (> 98.5%) and only sporadic random single dies.",
        "investigation_directions": [
            "Process conforms to standard control limits (SPC). Maintain standard control chart monitoring."
        ],
        "engineer_questions": [
            "Are SPC trend lines stable without mean shift or multi-point runs?"
        ],
        "verification_steps": [
            "Routine optical defect review on sampled passing wafers."
        ],
        "disclaimer": "Professional verification required. Nominal pattern classification reflects wafer map test yield."
    }
}

def get_root_cause_hypothesis(category: str) -> Dict[str, Any]:
    return ROOT_CAUSE_KNOWLEDGE_BASE.get(category, {
        "title": "Unclassified Pattern Signature",
        "spatial_evidence": "Pattern features do not match canonical WM-811K signature library.",
        "investigation_directions": ["Collect additional metrology data and perform manual review."],
        "engineer_questions": ["Is this an emerging defect mode?"],
        "verification_steps": ["Review physical wafer with in-line metrology."],
        "disclaimer": "Professional verification required."
    })
