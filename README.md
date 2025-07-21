# 📊 AgroConecta - Integration and E2E Testing Repository

This repository contains integration and E2E tests for SOFEA backend and frontend services. Tests are organized by service and flow, automatically generating detailed PDF reports.

---

## 📦 Requirements

1. **Python 3.10+**
2. **Node.js and npm** (for running E2E tests with Cypress)
3. Install dependencies:

```bash
pip install -r requirements.txt
npm install
```

---

## ⚙️ Configuration

1. Create a `.env` file in the root of the repository with the backend service URLs. Example:

```env
AUTHENTICATION_BACKEND="AUTHENTICATION_URL"
PRODUCT_BACKEND="PRODUCT_URL"
# Add more services as needed
```

2. Each backend service should be placed in its own folder in the root of the repository with the following structure:

```
ServiceName/
├── __init__.py
├── conftest.py
└── integration/
    └── integration_test.py
```

> Note: The `integration/` folder contains pytest test files.

3. Add each service name to the `SERVICES_DIRS` list in `run_backend_tests.py`:

```python
SERVICES_DIRS = [
    "AuthenticationService",
    "ProductService",
    # Add more services here
]
```

4. For E2E tests, ensure the frontend is running at `http://localhost:5173` and backend services are active.

---

## 🚀 Run the Tests

### Integration Tests (Backend)

To run integration tests for all services:

```bash
python run_backend_tests.py
```

This will:

- Run pytest in each listed service directory.
- Generate detailed reports in the `reports/` folder, including PDF summaries with results and charts.

### E2E Tests (Frontend)

#### Prerequisites

1. **Frontend running**: Ensure the frontend is active at `http://localhost:5173`.
2. **Backend running**: Backend services must be active.
3. **Test data**: The following users must exist in the database:
   - Buyer: `buyer@gmail.com` / `12345678`
   - Farmer: `farmer1@gmail.com` / `12345678`
4. **Test product**: A product named "**Test 0**" must exist.

#### Running E2E Tests

##### Option 1: Manual Execution (Recommended for development)

To debug the tests:

```bash
# Run in debug mode (runs one after the other)
npx cypress run --spec "cypress/e2e/buyer-chat.cy.js" --headed --no-exit
npx cypress run --spec "cypress/e2e/farmer-chat.cy.js" --headed --no-exit

# Run in interactive mode
npx cypress open
```

#### Logs

Execution logs are saved in:
- `logs/buyer-test.log` - Log for the buyer test.
- `logs/farmer-test.log` - Log for the farmer test.




---

## 📅 Reports

### Integration Test Reports

Generated reports include:

- A general summary with total test counts.
- Tables per service showing test results.
- Pie and bar charts per service.
- Error messages if any test fails.

Reports are saved in the `reports/` folder and automatically numbered.

### E2E Test Reports

#### Generate Complete Report

```bash
# Run tests and generate PDF automatically
npm run test:complete
```


**Generated file**: `cypress/reports/e2e-integration-report-[date].pdf`.

---

## 🔧 Recommendations

- Ensure all services are running on the specified ports before testing.
- Each service should use a dedicated test database or test environment.
- Use fixtures and internal test-only endpoints to reset data safely.
- For E2E tests, run the buyer tests first, followed by the farmer tests with a 1-2 second delay.

---

## 📁 Repository Structure

```
.
├── AuthenticationService/
│   ├── __init__.py
│   ├── conftest.py
│   └── integration/
│       └── integration_test.py
├── ProductService/
│   └── ...
│
├── User-Chat-E2E/
│    ├── cypress/
│    │   ├── e2e/
│    │   │   ├── buyer-chat.cy.js
│    │   │   └── farmer-chat.cy.js
│    │   └── reports/
│    │       └── e2e-integration-report-[date].pdf
│    ├── reports/
│    └── integration_report_1.pdf
├── run_backend_tests.py
├── generate_pdf_report.py
├── requirements.txt
├── package.json
└── .env
```

---

## 🤝 Contributing

When adding a new service:

1. Create a properly structured folder.
2. Add the folder name to `SERVICES_DIRS`.
3. Add its base URL to the `.env` file.


---
