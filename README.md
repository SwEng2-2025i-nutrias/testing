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

#### Prerequisites to the Chat service Tests E2E

1. **Frontend running**: Ensure the frontend is active at `http://localhost:5173`.
2. **Backend running**: Backend services must be active.
3. **Test data**: The following users must exist in the database:
   - Buyer: `comprador@gmail.com` / `12345678`
   - Farmer: `agricultor1@gmail.com` / `12345678`
4. **Test product**: A product named "**Prueba 0**" must exist and price shoud be less than 20.000 $.

#### Additional Prerequisites for Product Search Tests

To ensure the proper execution of the product search tests, the following data must exist in the database:

1. At least one product with the name "Tomate" or "Tomates".
2. At least one product categorized as a "fruit".
3. At least one product with a price greater than or equal to 5000.
4. At least one product with a quantity greater than or equal to 70.

#### Running E2E Tests

##### Option 1: Run All Tests (Recommended)

```bash
# Run complete test suite: auth → product search → buyer chat → farmer chat
npm run test:complete
```

This will:
1. Run authentication tests
2. Run product search tests  
3. Run buyer and farmer chat tests in parallel
4. Generate a single comprehensive PDF report

##### Option 2: Run Only Chat Tests

```bash
# Run only buyer and farmer chat tests
npm run test:chat
```

##### Option 3: Manual Execution (for debugging)

```bash
# Run individual test files for debugging
npx cypress run --spec "cypress/e2e/auth_test.cy.js" --headed --no-exit
npx cypress run --spec "cypress/e2e/product_search_test.cy.js" --headed --no-exit
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
- For E2E tests, run the buyer tests first, followed by the farmer tests with a 5 second delay.

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
│    │   │   ├── auth_test.cy.js
│    │   │   ├── product_search_test.cy.js
│    │   │   ├── buyer-chat.cy.js
│    │   │   └── farmer-chat.cy.js
│    │   └── reports/
│    │       └── e2e-integration-report-[date].pdf
│    ├── scripts/
│    │   ├── run-parallel-tests.js
│    │   └── generate-pdf.js
│    ├── package.json
│    └── ...
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
