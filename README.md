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
# Servicios Backend
AUTHENTICATION_BACKEND="http://localhost:5001/auth"
PRODUCT_BACKEND="http://localhost:5002/products"
SEARCH_BACKEND="http://localhost:5003/product-search"

# Servicio de Chat en Tiempo Real
CHAT_SERVICE_BASE="http://localhost:8000"
CHAT_WEBSOCKET_URL="http://localhost:8000"

# Credenciales de prueba
TEST_USER="test@agroconecta.com"
TEST_PASS="TestPassword123"

# Configuración para OnlineChatService
USE_MOCK_AUTH=true
JWT_SECRET_KEY=test-secret-key-only-for-development
```

> 💡 **Tip**: Copia `.env.example` a `.env` y ajusta las URLs según tu configuración.

2. Each service should be placed in its own folder in the root of the repository with the following structure:

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
    "ProductSearchService",
    "OnlineChatService",  # ✨ NUEVO: Chat en tiempo real
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

### 🧪 Run Tests for Specific Service

You can also run tests for a specific service:

```bash
# Tests básicos
cd AuthenticationService/integration && pytest integration_test.py -v

# Tests de WebSocket (OnlineChatService)
cd OnlineChatService/integration && pytest integration_test.py -v --tb=short
```

---

## 📅 Reports

Generated reports include:

- A general summary with total test counts.
- Tables per service showing test results.
- Pie and bar charts per service.
- Error messages if any test fails.

Reports are saved in the `reports/` folder and automatically numbered.

---

## 🤝 Contributing

When adding a new service:

1. Create a properly structured folder.
2. Add the folder name to `SERVICES_DIRS`.
3. Add its base URL to the `.env` file.
4. **For WebSocket services**: Add async test dependencies to `requirements.txt`
5. **For new auth patterns**: Update fixtures in `conftest.py`

## 📊 Metrics & Reporting

The PDF reports now include:

- **Chat Service Statistics**: WebSocket connections, message throughput
- **Async Test Performance**: Connection times, event response times
- **Multi-User Scenarios**: Complex interaction flows
- **Error Analysis**: WebSocket disconnections, authentication failures

---
