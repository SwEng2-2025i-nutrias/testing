import os
import json
from datetime import datetime
from fpdf import FPDF

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
        self.cell(0, 10, "Reporte de Pruebas de Integración - SOFEA", ln=False, align="L")
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
        self.cell(60, 8, "Test", 1)
        self.cell(30, 8, "Resultado", 1)
        self.cell(30, 8, "Duración", 1)
        self.ln()

        self.set_font("Arial", "", 9)
        for test in tests:
            full_nodeid = test.get("nodeid", "")
            test_name = full_nodeid.split("::")[-1]  # extraer nombre del test
            outcome = test.get("outcome", "unknown")
            duration = test.get("call", {}).get("duration", 0.0)

            self.cell(60, 8, test_name[:58], 1)  # limitar largo
            self.cell(30, 8, outcome, 1)
            self.cell(30, 8, f"{duration:.3f}s", 1)
            self.ln()

            if outcome == "failed":
                message = test.get("call", {}).get("crash", {}).get("message", "")
                if message:
                    self.set_text_color(200, 0, 0)
                    self.multi_cell(0, 6, f"Error: {message}")
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
    for data in reports.values():
        for test in data.get("tests", []):
            total += 1
            outcome = test.get("outcome")
            if outcome == "passed":
                passed += 1
            elif outcome == "failed":
                failed += 1
            elif outcome == "skipped":
                skipped += 1

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

    for service, data in reports.items():
        pdf.chapter_title(f"Servicio: {service}")
        pdf.add_test_table(data.get("tests", []))

    output_path = get_next_report_filename()
    pdf.output(output_path)
    print(f"PDF generado en: {output_path}")


if __name__ == "__main__":
    report_data = collect_json_reports(REPORTS_DIR)
    generate_pdf(report_data)
