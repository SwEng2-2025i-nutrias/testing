# 📊 AgroConecta - Integration Testing Repository

This repository contains integration tests for SOFEA backend services. Tests are organized by service and automatically generate detailed PDF reports.

---

## 📦 Requirements

1. **Python 3.10+**
2. Install dependencies:

```bash
pip install -r requirements.txt
```

---

## ⚙️ Configuration

1. Create a `.env` file in the root of the repository with the service URLs. Example:

```env
AUTHENTICATION_BACKEND="AUTHENTICATION_URL"
PRODUCT_BACKEND="PRODUCT_URL"
# Add more services as needed
```

2. Each service should be placed in its own folder in the root of the repository with the following structure:

```
ServiceName/
├── __init__.py
├── conftest.py
└── integration/
    └── integration_test.py
```

> Note: The `Integración/` folder contains pytest test files.

3. Add each service name to the `SERVICES_DIRS` list in `run_backend_tests.py`:

```python
SERVICES_DIRS = [
    "AuthenticationService",
    "ProductService",
    # Add more services here
]
```

---

## 🚀 Run the Tests

To run integration tests for all services:

```bash
python run_backend_tests.py
```

This will:

- Run pytest in each listed service directory.
- Generate detailed reports in the `reports/` folder, including PDF summaries with results and charts.

---

## 📅 Reports

Generated reports include:

- A general summary with total test counts.
- Tables per service showing test results.
- Pie and bar charts per service.
- Error messages if any test fails.

Reports are saved in the `reports/` folder and automatically numbered.

---

## 🔧 Recommendations

- Ensure all services are running on the specified ports before testing.
- Each service should use a dedicated test database or test environment.
- You can use fixtures and internal test-only endpoints to reset data safely.

---

## 📁 Repository Structure

```
.
├── AuthenticationService/
│   ├── __init__.py
│   ├── conftest.py
│   └── Integración/
│       └── integration_test.py
├── ProductService/
│   └── ...
├── reports/
│   └── integration_report_1.pdf
├── run_backend_tests.py
├── generate_pdf_report.py
├── requirements.txt
└── .env
```

---

## 🤝 Contributing

When adding a new service:

1. Create a properly structured folder.
2. Add the folder name to `SERVICES_DIRS`.
3. Add its base URL to the `.env` file.

---
