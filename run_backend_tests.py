import os
import subprocess
from generate_pdf_report import collect_json_reports, generate_pdf
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(override=True)

TESTS_DIR = "."
SERVICES_DIRS = [
    "AuthenticationService",
    "ProductService",
]

def run_all_backend_tests():
    for service in SERVICES_DIRS:
        path = os.path.join(TESTS_DIR, service, "integration")
        print(f"🔍 Ejecutando tests para: {service}")
        if os.path.isdir(path):
            print(path)
            subprocess.run(
                ["pytest", "./integration_test.py", "--json-report", "--json-report-file=report.json"],
                cwd=path
            )


if __name__ == "__main__":
    run_all_backend_tests()
    reports = collect_json_reports(TESTS_DIR)
    generate_pdf(reports)
