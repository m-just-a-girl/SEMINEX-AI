import io
import csv
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf_report(inspection_data: Dict[str, Any]) -> bytes:
    """
    Generates an executive-level semiconductor quality inspection PDF report.
    Conforms to SEMI NEX AI brand identity, transparency rules, and audit requirements.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Styles
    brand_title_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0B1528'),
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0891B2'),
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3563'),
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
    )
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>SEMI NEX AI</b>", brand_title_style),
            Paragraph("<b>DEFECT INSPECTION REPORT</b><br/><font size=8>CONFIDENTIAL & AUDIT READY</font>", ParagraphStyle('RAlign', parent=styles['Normal'], alignment=2, textColor=colors.HexColor('#0B1528')))
        ],
        [
            Paragraph("AI-Powered Semiconductor Quality Intelligence & Decision Support", subtitle_style),
            Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", ParagraphStyle('RSub', parent=styles['Normal'], alignment=2, fontSize=8, textColor=colors.HexColor('#64748B')))
        ]
    ]
    t_header = Table(header_data, colWidths=[340, 200])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#06B6D4'), spaceAfter=12))

    # 2. Inspection Identification Table
    meta_table_data = [
        [
            Paragraph("<b>Inspection ID:</b>", body_style),
            Paragraph(str(inspection_data.get("id", "N/A")), body_style),
            Paragraph("<b>Model Version:</b>", body_style),
            Paragraph(str(inspection_data.get("model_version", "v1.0.0")), body_style),
        ],
        [
            Paragraph("<b>Timestamp:</b>", body_style),
            Paragraph(str(inspection_data.get("timestamp", "N/A")), body_style),
            Paragraph("<b>Operating Mode:</b>", body_style),
            Paragraph(f"<b>{inspection_data.get('model_mode', 'REAL INFERENCE')}</b>", body_style),
        ],
        [
            Paragraph("<b>Lot Identifier:</b>", body_style),
            Paragraph(str(inspection_data.get("lot_name", "N/A")), body_style),
            Paragraph("<b>Wafer Index:</b>", body_style),
            Paragraph(str(inspection_data.get("wafer_index", "N/A")), body_style),
        ],
        [
            Paragraph("<b>Input Source:</b>", body_style),
            Paragraph(str(inspection_data.get("input_source", "Dataset Record")), body_style),
            Paragraph("<b>Original Dataset Label:</b>", body_style),
            Paragraph(str(inspection_data.get("original_label", "Unlabeled")), body_style),
        ],
    ]
    t_meta = Table(meta_table_data, colWidths=[100, 170, 120, 150])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    # 3. Model Classification & Decision Support
    story.append(Paragraph("<b>1. Classification & Triage Recommendation</b>", h2_style))
    pred_class = inspection_data.get("predicted_class", "none")
    conf = float(inspection_data.get("confidence", 0.0))
    rec = inspection_data.get("recommendation", "Review Recommended")
    
    # Rec color
    rec_color = colors.HexColor('#EF4444') if rec == "Investigation Recommended" else (colors.HexColor('#10B981') if rec == "Low Concern" else colors.HexColor('#F59E0B'))

    decision_data = [
        [
            Paragraph("<b>Predicted Defect Class:</b>", body_style),
            Paragraph(f"<font size=11 color='#0B1528'><b>{pred_class}</b></font>", body_style),
            Paragraph("<b>Classification Confidence:</b>", body_style),
            Paragraph(f"<b>{round(conf * 100, 2)}%</b>", body_style),
        ],
        [
            Paragraph("<b>Triage Recommendation:</b>", body_style),
            Paragraph(f"<b>{rec}</b>", ParagraphStyle('Rec', parent=body_style, textColor=rec_color)),
            Paragraph("<b>Review Status:</b>", body_style),
            Paragraph(f"<b>{inspection_data.get('review_status', 'pending').upper()}</b>", body_style),
        ],
        [
            Paragraph("<b>Decision Justification:</b>", body_style),
            Paragraph(str(inspection_data.get("recommendation_reason", "Standard triage criteria met.")), body_style),
            Paragraph("<b>Human Notes:</b>", body_style),
            Paragraph(str(inspection_data.get("reviewer_notes") or "No notes submitted."), body_style),
        ]
    ]
    t_decision = Table(decision_data, colWidths=[120, 150, 120, 150])
    t_decision.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94A3B8')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_decision)
    story.append(Spacer(1, 14))

    # 4. Spatial Analysis Evidence
    story.append(Paragraph("<b>2. Spatial Analysis & Wafer Topography Metrics</b>", h2_style))
    failing = inspection_data.get("failing_die_count", 0)
    total = inspection_data.get("total_die_count", 0)
    fail_rate = inspection_data.get("failure_rate", 0.0)
    
    spatial_data = [
        [
            Paragraph("<b>Total Wafer Dies:</b>", body_style),
            Paragraph(f"{total:,}", body_style),
            Paragraph("<b>Failing Die Count:</b>", body_style),
            Paragraph(f"{failing:,}", body_style),
        ],
        [
            Paragraph("<b>Wafer Yield Rate:</b>", body_style),
            Paragraph(f"<b>{round(100.0 - fail_rate, 2)}%</b>", body_style),
            Paragraph("<b>Failure Proportion:</b>", body_style),
            Paragraph(f"<b>{fail_rate}%</b>", body_style),
        ]
    ]
    t_spatial = Table(spatial_data, colWidths=[120, 150, 120, 150])
    t_spatial.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFFFF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_spatial)
    story.append(Spacer(1, 14))

    # 5. Root Cause Hypothesis & Engineering Guidance
    story.append(Paragraph("<b>3. Possible Root Cause / Hypothesis & Engineering Guidance</b>", h2_style))
    hypo_text = inspection_data.get("hypothesis") or "Observed defect pattern warrants engineering review of tool chamber conditions."
    story.append(Paragraph(f"<b>Working Hypothesis:</b> {hypo_text}", body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Suggested Verification Directions:</b><br/>"
        "• Conduct optical inspection of wafer bevel and perimeter clamp marks.<br/>"
        "• Review recent electrostatic chuck (ESC) temperature stability and helium leak check logs.<br/>"
        "• Verify chamber preventive maintenance schedule and focus ring RF lifetime hours.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # 6. Compliance, Governance & Transparency Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    disclaimer_text = (
        "<b>LEGAL & AUDIT DISCLAIMER — NOT A SUBSTITUTE FOR PROFESSIONAL FAB INSPECTION:</b><br/>"
        "SEMI NEX AI is an AI-assisted semiconductor intelligence and decision support platform. "
        "Predictions and risk scores are derived from topological wafer map die matrices and machine learning models. "
        "Wafer map patterns alone do not establish physical causes, electrical performance, or contamination provenance. "
        "Autonomous lot disposition is not supported; critical decisions require qualified quality engineering verification."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle('Disc', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#64748B'))))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

def export_inspections_to_csv(inspections: List[Dict[str, Any]]) -> str:
    """Exports inspection history to standardized CSV string."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Inspection ID",
        "Timestamp (UTC)",
        "Input Source",
        "Record ID",
        "Lot Name",
        "Wafer Index",
        "Original Label",
        "Predicted Class",
        "Confidence",
        "Model Version",
        "Model Mode",
        "Failing Dies",
        "Total Dies",
        "Failure Rate (%)",
        "Recommendation",
        "Review Status",
        "Reviewed Category",
        "Reviewer Notes"
    ])
    for item in inspections:
        writer.writerow([
            item.get("id"),
            item.get("timestamp"),
            item.get("input_source"),
            item.get("record_id"),
            item.get("lot_name"),
            item.get("wafer_index"),
            item.get("original_label") or "",
            item.get("predicted_class"),
            item.get("confidence"),
            item.get("model_version"),
            item.get("model_mode"),
            item.get("failing_die_count"),
            item.get("total_die_count"),
            item.get("failure_rate"),
            item.get("recommendation"),
            item.get("review_status"),
            item.get("reviewed_category") or "",
            item.get("reviewer_notes") or ""
        ])
    return output.getvalue()
