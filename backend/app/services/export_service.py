import json
import io
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

class ExportService:
    def export_json(self, data: Dict[str, Any]) -> str:
        return json.dumps(data, indent=2)
        
    def export_pdf(self, data: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        if not HAS_REPORTLAB:
            # Fallback text format if reportlab is not loaded
            buffer.write(b"PDF Generation library (ReportLab) is not available. Here is the JSON representation:\n\n")
            buffer.write(json.dumps(data, indent=2).encode('utf-8'))
            buffer.seek(0)
            return buffer

        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#7c3aed'), # Purple theme
            spaceAfter=20
        )
        
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#3b82f6'), # Blue theme
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=8
        )

        story.append(Paragraph("LLM INSIDE — Simulation Report", title_style))
        story.append(Paragraph(f"Created: {data.get('created_at', 'Now')}", body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Input Config", h2_style))
        story.append(Paragraph(f"<b>Prompt:</b> {data.get('prompt', '')}", body_style))
        story.append(Paragraph(f"<b>Model:</b> {data.get('model_name', '')}", body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Tokens Generated", h2_style))
        tokens = data.get('tokens', [])
        tokens_text = " , ".join([f"{t.get('text', '')} ({t.get('id', '')})" for t in tokens])
        story.append(Paragraph(tokens_text, body_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Output Response", h2_style))
        story.append(Paragraph(data.get('output_text', ''), body_style))

        doc.build(story)
        buffer.seek(0)
        return buffer

export_service = ExportService()
