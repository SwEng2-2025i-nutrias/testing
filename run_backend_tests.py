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
    "ProductSearchService",
    "OnlineChatService",  # Servicio de chat en tiempo real con WebSocket
]

def run_all_backend_tests():
    for service in SERVICES_DIRS:
        path = os.path.join(TESTS_DIR, service, "integration")
        print(f"🔍 Ejecutando tests para: {service}")
        if os.path.isdir(path):
            print(path)
            # Para OnlineChatService, usar configuración especial de pytest para async
            if service == "OnlineChatService":
                subprocess.run(
                    ["pytest", "./integration_test.py", "--json-report", "--json-report-file=report.json", "-v", "--tb=short"],
                    cwd=path
                )
            else:
                subprocess.run(
                    ["pytest", "./integration_test.py", "--json-report", "--json-report-file=report.json"],
                    cwd=path
                )


if __name__ == "__main__":
    print("🚀 Iniciando pruebas de integración para todos los servicios backend...")
    print("📋 Servicios incluidos:")
    for service in SERVICES_DIRS:
        description = {
            "AuthenticationService": "Autenticación y gestión de usuarios",
            "ProductService": "CRUD de productos agrícolas", 
            "ProductSearchService": "Búsqueda y filtrado de productos",
            "OnlineChatService": "Chat en tiempo real con WebSocket y API REST"
        }.get(service, "Servicio backend")
        print(f"   • {service}: {description}")
    
    print("\n" + "="*60)
    run_all_backend_tests()
    print("="*60)
    print("📊 Generando reporte PDF consolidado...")
    reports = collect_json_reports(TESTS_DIR)
    generate_pdf(reports)
    print("✅ ¡Pruebas completadas! Revisa el reporte PDF generado.")
