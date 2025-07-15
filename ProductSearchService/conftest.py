# conftest.py
import os
import pytest
import requests
from datetime import date, timedelta
from dotenv import load_dotenv, find_dotenv

# 1) Carga de variables de entorno (.env.test o .env)
dotenv_path = find_dotenv('.env.test', raise_error_if_not_found=False) or \
              find_dotenv('.env',       raise_error_if_not_found=True)
load_dotenv(dotenv_path, override=True)

# 2) Constructores de URLs base desde .env
auth_base    = os.getenv("AUTHENTICATION_BACKEND").rstrip('/')
product_base = os.getenv("PRODUCT_BACKEND").rstrip('/')   # ya incluye '/products'
search_base  = os.getenv("SEARCH_BACKEND").rstrip('/')    # ya incluye '/product-search'

LOGIN_URL       = f"{auth_base}/login"
REGISTER_URL    = f"{auth_base}/register"
PS_PRODUCTS_URL = product_base
PS_MY_URL       = f"{product_base}/me"
SS_SEARCH_URL   = search_base

USER_FIELD = "email"
PASS_FIELD = "password"

@pytest.fixture(scope="session")
def auth_token():
    # Login o registro para obtener Bearer token
    creds = {
        USER_FIELD: os.getenv("TEST_USER"),
        PASS_FIELD: os.getenv("TEST_PASS")
    }
    resp = requests.post(LOGIN_URL, json=creds)
    if resp.status_code == 400 and "does not exist" in resp.text.lower():
        # Registrar usuario si no existe
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
    # Encabezados con token para Product Service
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

@pytest.fixture(autouse=True)
def seed_data(headers):
    """
    Fixture que antes de cada test:
      1) Borra solo los productos del usuario de prueba via GET /me y DELETE
      2) Siembra ejemplos con todos los campos
    Después del test, limpia de nuevo.
    """
    # 1) CLEANUP inicial: solo productos del usuario
    resp = requests.get(PS_MY_URL, headers=headers)
    if resp.status_code == 200:
        for p in resp.json().get('products', resp.json()):
            requests.delete(f"{PS_PRODUCTS_URL}/{p['product_id']}", headers=headers)

    # 2) SEED de datos nuevos (Product Service)
    today = date.today()
    ejemplos = [
        {"name": "Manzana Roja", "type": "Fruta", "quantity": 50, "price_per_unit": 1.2,
         "description": "Manzanas frescas", "harvest_date": (today - timedelta(days=5)).isoformat()},
        {"name": "Lechuga", "type": "Vegetal", "quantity": 20, "price_per_unit": 0.8,
         "description": "Lechuga de hoja verde", "harvest_date": (today - timedelta(days=1)).isoformat()},
        {"name": "Tomate Cherry", "type": "Vegetal", "quantity": 15, "price_per_unit": 2.5,
         "description": "Tomates cherry dulces", "harvest_date": today.isoformat()},
    ]
    for prod in ejemplos:
        r = requests.post(PS_PRODUCTS_URL, json=prod, headers=headers)
        assert r.status_code == 201, f"Seed falló para {prod['name']}: {r.status_code} {r.text}"

    yield

    # 3) CLEANUP final: solo productos del usuario
    resp = requests.get(PS_MY_URL, headers=headers)
    if resp.status_code == 200:
        for p in resp.json().get('products', resp.json()):
            requests.delete(f"{PS_PRODUCTS_URL}/{p['product_id']}", headers=headers)
