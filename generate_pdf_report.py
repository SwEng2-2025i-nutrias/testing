import os
import json
from datetime import datetime
from fpdf import FPDF
from graphics.graphics import generate_service_pie_chart

REPORTS_DIR = "tests"
OUTPUT_FOLDER = "reports"

def get_next_report_filename():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    existing = [
        fname for fname in os.listdir(OUTPUT_FOLDER)
        if fname.startswith("integration_report_") and fname.endswith(".pdf")
    ]
    numbers = []
    for fname in existing:
        try:
            num = int(fname.replace("integration_report_", "").replace(".pdf", ""))
            numbers.append(num)
        except ValueError:
            continue
    next_num = max(numbers, default=0) + 1
    return os.path.join(OUTPUT_FOLDER, f"integration_report_{next_num}.pdf")


class PDFReport(FPDF):
    def header(self):
        image_path = "./assets/logo.jpg"
        self.set_font("Arial", "B", 12)
        self.set_xy(10, 10)
        self.cell(0, 10, "Reporte de Pruebas de Integración - AgroConecta", ln=False, align="L")
        if os.path.exists(image_path):
            self.image(image_path, x=170, y=6, h=15)
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Página {self.page_no()}", align="C")

    def chapter_title(self, title):
        self.set_font("Arial", "B", 11)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 8, title, ln=True, fill=True)
        self.ln(1)

    def chapter_body(self, content):
        self.set_font("Arial", "", 10)
        self.multi_cell(0, 6, content)
        self.ln()

    def add_test_table(self, tests):
        self.set_font("Arial", "B", 10)
        col_widths = [60, 30, 30, 70]  # Anchos: Test, Resultado, Duración, Razón
        headers = ["Test", "Resultado", "Duración", "Razón"]
        line_height = 8

        # Encabezados
        for i, header in enumerate(headers):
            self.cell(col_widths[i], line_height, header, border=1)
        self.ln()

        # Filas
        self.set_font("Arial", "", 9)
        for test in tests:
            full_nodeid = test.get("nodeid", "")
            test_name = full_nodeid.split("::")[-1]
            outcome = test.get("outcome", "unknown")
            duration = test.get("call", {}).get("duration", 0.0)

            # Extraer mensaje de error si falló
            reason = ""
            if outcome == "failed":
                reason = test.get("call", {}).get("crash", {}).get("message", "")
                reason = reason.replace("\n", " ").strip()

            # Calcular cuántas líneas necesita la razón para ajustar la altura
            reason_lines = self.multi_cell(col_widths[3], line_height, reason, border=0, split_only=True)
            max_lines = max(1, len(reason_lines))
            row_height = line_height * max_lines

            # Guardar posición inicial
            x = self.get_x()
            y = self.get_y()

            # Test name
            self.multi_cell(col_widths[0], row_height, test_name[:58], border=1)
            self.set_xy(x + col_widths[0], y)

            # Resultado
            self.cell(col_widths[1], row_height, outcome, border=1)
            self.set_xy(x + col_widths[0] + col_widths[1], y)

            # Duración
            self.cell(col_widths[2], row_height, f"{duration:.3f}s", border=1)
            self.set_xy(x + col_widths[0] + col_widths[1] + col_widths[2], y)

            # Razón del fallo
            if outcome == "failed":
                self.set_text_color(200, 0, 0)
            self.multi_cell(col_widths[3], line_height, reason, border=1)
            self.set_text_color(0, 0, 0)

        self.ln()




def collect_json_reports(report_dir):
    reports = {}
    for root, dirs, files in os.walk(report_dir):
        for file in files:
            if file == "report.json":
                # El nombre del servicio es la carpeta anterior a donde está el report.json
                service = os.path.basename(os.path.dirname(root))
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    reports[service] = data
    return reports



def generate_pdf(reports):
    pdf = PDFReport()
    pdf.add_page()

    total, passed, failed, skipped = 0, 0, 0, 0
    service_stats = {}

    for service, data in reports.items():
        sp = sf = ss = 0
        for test in data["tests"]:
            total += 1
            outcome = test["outcome"]
            if outcome == "passed":
                passed += 1
                sp += 1
            elif outcome == "failed":
                failed += 1
                sf += 1
            elif outcome == "skipped":
                skipped += 1
                ss += 1
        service_stats[service] = {"passed": sp, "failed": sf, "skipped": ss}

    resumen = (
        f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        f"Total de pruebas: {total}\n"
        f"Éxitos: {passed}\n"
        f"Fallos: {failed}\n"
        f"Skips: {skipped}\n"
        f"Servicios cubiertos: {', '.join(reports.keys())}"
    )
    pdf.chapter_title("Resumen general")
    pdf.chapter_body(resumen)

    # Añadir tabla por servicio + gráfico individual
    temp_chart_paths = []

    for service, data in reports.items():
        pdf.chapter_title(f"Servicio: {service}")
        pdf.add_test_table(data["tests"])

        stats = service_stats[service]
        pie_path = generate_service_pie_chart(
            service,
            stats["passed"],
            stats["failed"],
            stats["skipped"]
        )
        if pie_path:
            pdf.image(pie_path, w=80)
            temp_chart_paths.append(pie_path)

    output_path = get_next_report_filename()
    pdf.output(output_path)
    print(f"PDF generado en: {output_path}")

    # Limpiar archivos temporales
    for temp_path in temp_chart_paths:
        if os.path.exists(temp_path):
            os.remove(temp_path)
