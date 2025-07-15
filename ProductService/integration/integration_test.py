import os
import pytest
import requests
from datetime import datetime

# Carga de variables de entorno (si usas python-dotenv)
from dotenv import load_dotenv
load_dotenv()

# Endpoints definidos en .env con los nombres requeridos
BASEAUTH_URL = os.getenv("AUTHENTICATION_BACKEND")
BASE_URL = os.getenv("PRODUCT_BACKEND")
AUTH_URL = f"{BASEAUTH_URL}/login"
REGISTER_URL = f"{BASEAUTH_URL}/register"

# Campos de credenciales en la petición de login (email y password)
USER_FIELD = "email"
PASS_FIELD = "password"

@pytest.fixture(scope='session')
def auth_token():
    """
    Intenta login; si el usuario no existe, lo registra y reintenta login.
    Skippea ante otros errores.
    """
    credentials = {
        USER_FIELD: os.getenv("TEST_USER","TEST_USER@example.com"),
        PASS_FIELD: os.getenv("TEST_PASS","TEST_PASS")
    }

    # Primer intento de login
    try:
        resp = requests.post(AUTH_URL, json=credentials)
    except requests.exceptions.RequestException as e:
        pytest.skip(f"No se pudo conectar a AUTH_URL: {e}")

    # Si el usuario no existe, registrar y reintentar
    if resp.status_code == 400 and 'does not exist' in resp.text.lower():
        reg_payload = {
            USER_FIELD: credentials[USER_FIELD],
            PASS_FIELD: credentials[PASS_FIELD],
            # Campos opcionales para registro
            'name': os.getenv("TEST_USER_NAME", "testuser"),
            'role': os.getenv("TEST_USER_ROLE", "user")
        }
        try:
            reg_resp = requests.post(REGISTER_URL, json=reg_payload)
        except requests.exceptions.RequestException as e:
            pytest.skip(f"No se pudo conectar a REGISTER_URL: {e}")
        assert reg_resp.status_code in (200, 201), \
            f"Registro falló: {reg_resp.status_code} {reg_resp.text}"
        resp = requests.post(AUTH_URL, json=credentials)

    # Validar login final
    assert resp.status_code == 200, f"Login falló: {resp.status_code} {resp.text}"
    data = resp.json()
    token = data.get('access_token') or data.get('token')
    assert token, "No se devolvió token en la respuesta"
    return token

@pytest.fixture
def headers(auth_token):
    """Encabezados HTTP con Bearer token"""
    return {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }

# --------------------- Tests de productos ---------------------

def test_get_all_products():
    resp = requests.get(BASE_URL)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_create_product_unauthorized():
    payload = {
        'name': 'Tomate', 'type': 'Vegetal', 'quantity': 10,
        'price_per_unit': 2.5, 'description': 'Tomates frescos',
        'harvest_date': datetime.now().isoformat()
    }
    resp = requests.post(BASE_URL, json=payload)
    assert resp.status_code == 401


def test_create_and_get_product(headers):
    payload = {
        'name': 'Tomate', 'type': 'Vegetal', 'quantity': 10,
        'price_per_unit': 2.5, 'description': 'Tomates frescos',
        'harvest_date': datetime.now().isoformat()
    }
    resp = requests.post(BASE_URL, json=payload, headers=headers)
    assert resp.status_code == 201
    prod_list = requests.get(BASE_URL).json()
    assert prod_list, "No se crearon productos"
    prod_id = prod_list[-1]['product_id']
    get_resp = requests.get(f"{BASE_URL}/{prod_id}")
    assert get_resp.status_code == 200 and get_resp.json()['name'] == 'Tomate'


def test_get_my_products(headers):
    resp = requests.get(f"{BASE_URL}/me", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert 'products' in body and isinstance(body['products'], list)


def test_patch_update_and_delete(headers):
    prods = requests.get(BASE_URL).json()
    assert prods, "No hay productos para modificar"
    prod_id = prods[-1]['product_id']
    patch_resp = requests.patch(f"{BASE_URL}/{prod_id}", json={'quantity': 5}, headers=headers)
    assert patch_resp.status_code == 200
    put_resp = requests.put(f"{BASE_URL}/{prod_id}", json={'name': 'Tomate Cherry', 'quantity': 15}, headers=headers)
    assert put_resp.status_code == 200
    del_resp = requests.delete(f"{BASE_URL}/{prod_id}", headers=headers)
    assert del_resp.status_code == 200
