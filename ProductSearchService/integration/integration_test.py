import os
import pytest
import requests
from datetime import date, timedelta, datetime
from dotenv import load_dotenv, find_dotenv

# ─── 1) Carga de variables de entorno (.env.test o .env) ─────────────────────────
dotenv_path = find_dotenv('.env.test', raise_error_if_not_found=False) or \
              find_dotenv('.env',       raise_error_if_not_found=True)
load_dotenv(dotenv_path, override=True)

# ─── 2) Construcción de las URLs ─────────────────────────────────────────────────
AUTH_BASE       = os.getenv("AUTHENTICATION_BACKEND").rstrip('/')
PRODUCT_BACKEND = os.getenv("PRODUCT_BACKEND").rstrip('/')  # incluye /products
SEARCH_BACKEND  = os.getenv("SEARCH_BACKEND").rstrip('/') # incluye /product-search

LOGIN_URL    = f"{AUTH_BASE}/login"
REGISTER_URL = f"{AUTH_BASE}/register"
PS_PRODUCTS_URL = PRODUCT_BACKEND  # POST/DELETE aquí
SEARCH_URL   = SEARCH_BACKEND   # GET aquí

USER_FIELD = "email"
PASS_FIELD = "password"

@pytest.fixture(scope="session")
def auth_token():
    creds = {
        USER_FIELD: os.getenv("TEST_USER"),
        PASS_FIELD: os.getenv("TEST_PASS")
    }
    # Intento de login
    resp = requests.post(LOGIN_URL, json=creds)
    # Si no existe el usuario, lo registramos y reintentamos
    if resp.status_code == 400 and "does not exist" in resp.text.lower():
        reg = requests.post(REGISTER_URL, json={
            USER_FIELD: creds[USER_FIELD],
            PASS_FIELD: creds[PASS_FIELD],
            "name": os.getenv("TEST_USER_NAME", "pytest"),
            "role": os.getenv("TEST_USER_ROLE", "user")
        })
        assert reg.status_code in (200, 201), f"Registro falló: {reg.text}"
        resp = requests.post(LOGIN_URL, json=creds)

    assert resp.status_code == 200, f"Login falló: {resp.text}"
    token = resp.json().get("access_token") or resp.json().get("token")
    assert token, "No se obtuvo token en la respuesta"
    return token

@pytest.fixture(scope="session")
def headers(auth_token):
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

@pytest.fixture(autouse=True)
def seed_data(headers):
    """
    Antes de cada test:
      1) Limpia todos los productos existentes (Product Service)
      2) Siembra datos de ejemplo
    Después del test, limpia de nuevo.
    """
    # 1) CLEANUP inicial
    resp = requests.get(f"{PS_PRODUCTS_URL}", headers=headers)
    if resp.status_code == 200:
        for p in resp.json():
            requests.delete(f"{PS_PRODUCTS_URL}/{p['product_id']}", headers=headers)

    # 2) SEED de datos nuevos
    today = date.today()
    ejemplos = [
        {"name": "Manzana Roja",  "type": "Fruta",    "quantity": 50, "price_per_unit": 1.2, "description": "Manzanas frescas", "harvest_date": (today - timedelta(days=5)).isoformat()},
        {"name": "Lechuga",       "type": "Vegetal",  "quantity": 20, "price_per_unit": 0.8, "description": "Lechuga de hoja verde", "harvest_date": (today - timedelta(days=1)).isoformat()},
        {"name": "Tomate Cherry", "type": "Vegetal",  "quantity": 15, "price_per_unit": 2.5, "description": "Tomates cherry dulces", "harvest_date": today.isoformat()},
    ]
    for prod in ejemplos:
        r = requests.post(PS_PRODUCTS_URL, json=prod, headers=headers)
        assert r.status_code in (200, 201), f"Seed falló para {prod['name']}: {r.status_code} {r.text}"

    yield

    # 3) CLEANUP final
    resp = requests.get(f"{PS_PRODUCTS_URL}", headers=headers)
    if resp.status_code == 200:
        for p in resp.json():
            requests.delete(f"{PS_PRODUCTS_URL}/{p['product_id']}", headers=headers)

# ─── Test de búsqueda ──────────────────────────────────────────────────────────────
def test_search_by_name():
    """
    Verifica que el Search Service filtre correctamente por nombre parcial.
    """
    resp = requests.get(SEARCH_URL, params={"name": "Manzana"})
    assert resp.status_code == 200
    data = resp.json()
    assert all("Manzana" in item["name"] for item in data)



def test_filter_type_and_price_range(headers):
    params = {"type": "Vegetal", "min_price": 1.0, "max_price": 2.0}
    resp = requests.get(SEARCH_URL, params=params, headers=headers)
    assert resp.status_code == 200
    for item in resp.json():
        assert item["type"] == "Vegetal"
        assert 1.0 <= item["price_per_unit"] <= 2.0

def test_filter_quantity_and_harvest_date_range(headers):
    """
    Verifica que los productos devueltos cumplan con rango de cantidad y fecha de cosecha.
    """
    # Establecer rango de fechas como objetos date
    today = date.today()
    start_date = today - timedelta(days=4)
    end_date = today

    params = {
        "min_quantity": 10,
        "max_quantity": 35,
        # se envían como strings 'YYYY-MM-DD'
        "harvest_start": start_date.isoformat(),
        "harvest_end": end_date.isoformat()
    }

    # Llamada al Search Service
    resp = requests.get(SEARCH_URL, params=params, headers=headers)
    assert resp.status_code == 200, f"Status inesperado: {resp.status_code}"

    data = resp.json()
    assert isinstance(data, list), "La respuesta debe ser una lista"

    for item in data:
        # Verificar cantidad
        qty = item.get("quantity")
        assert 10 <= qty <= 35, f"Quantity fuera de rango: {qty}"

        # Parsear harvest_date y comparar como date
        raw = item.get("harvest_date")
        # Si viene con hora, convertimos a datetime
        try:
            item_dt = datetime.fromisoformat(raw)
        except ValueError:
            # fallback si solo hay fecha
            item_dt = datetime.fromisoformat(raw + 'T00:00:00')
        item_date = item_dt.date()
        assert start_date <= item_date <= end_date, (
            f"Fecha harvest_date fuera de rango: {item_date}")


@pytest.mark.parametrize("field,dir", [
    ("name","asc"), ("name","desc"),
    ("price_per_unit","asc"), ("price_per_unit","desc"),
    ("quantity","asc"), ("quantity","desc"),
    ("harvest_date","asc"), ("harvest_date","desc"),
])
def test_ordering(field, dir, headers):
    resp = requests.get(SEARCH_URL, params={"order_by": field, "order_dir": dir}, headers=headers)
    assert resp.status_code == 200
    lst = resp.json()
    # Comprueba ordenamiento
    values = [item[field] for item in lst]
    sorted_vals = sorted(values, reverse=(dir=="desc"))
    assert values == sorted_vals

def test_no_results(headers):
    resp = requests.get(SEARCH_URL, params={"name": "Inexistente"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []



