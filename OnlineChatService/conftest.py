import os
import pytest
import requests
import asyncio
import socketio
from datetime import datetime
from faker import Faker
import json
import time
import jwt

# Configuración por defecto (no requiere archivo .env)
CHAT_SERVICE_BASE = os.getenv("CHAT_SERVICE_BASE", "http://localhost:8000")
WEBSOCKET_URL = os.getenv("CHAT_WEBSOCKET_URL", "http://localhost:8000")

# Headers y configuración
fake = Faker()

# Clave secreta que debe coincidir con la del mock_auth_service del OnlineChatService
JWT_SECRET_KEY = "test-secret-key-only-for-development"

def generate_valid_jwt_token(user_id: str, name: str = None, email: str = None, role: str = "user"):
    """Generar token JWT válido para el mock_auth_service"""
    payload = {
        'user_id': user_id,
        'name': name or f'Usuario De Prueba {user_id.replace("user", "").replace("admin", "Administrador")}',
        'email': email or f'{user_id}@test.com',
        'role': role
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

# Generar tokens JWT dinámicamente para estar siempre sincronizados
def _generate_tokens():
    """
    Generar tokens dinámicamente usando la misma lógica que el mock_auth_service
    
    IMPORTANTE: Esta función genera tokens usando la misma clave secreta (JWT_SECRET_KEY)
    y estructura de payload que usa el mock_auth_service del OnlineChatService.
    Esto garantiza que los tokens generados para testing sean válidos.
    """
    return {
        'user1': generate_valid_jwt_token('user1', 'Usuario De Prueba 1', 'user1@test.com', 'user'),
        'user2': generate_valid_jwt_token('user2', 'Usuario De Prueba 2', 'user2@test.com', 'user'),
        'admin': generate_valid_jwt_token('admin', 'Administrador', 'admin@test.com', 'admin'),
    }

# Tokens JWT válidos generados dinámicamente (sincronizados con mock_auth_service)
MOCK_TOKENS = _generate_tokens()

# Remover fixture event_loop personalizada para evitar conflictos

@pytest.fixture(scope="session")
def service_health_check():
    """Verificar que el servicio de chat esté disponible antes de ejecutar pruebas"""
    try:
        response = requests.get(f"{CHAT_SERVICE_BASE}/health", timeout=10)
        if response.status_code != 200:
            pytest.skip(f"Servicio de chat no disponible. Status: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        pytest.skip(f"No se pudo conectar al servicio de chat: {e}")

@pytest.fixture(params=['user1', 'user2'])
def auth_token(request):
    """Fixture parametrizada que proporciona tokens de diferentes usuarios"""
    return MOCK_TOKENS[request.param]

@pytest.fixture
def user1_token():
    """Token específico del usuario 1"""
    return MOCK_TOKENS['user1']

@pytest.fixture
def user2_token():
    """Token específico del usuario 2"""
    return MOCK_TOKENS['user2']

@pytest.fixture
def admin_token():
    """Token específico del administrador"""
    return MOCK_TOKENS['admin']

@pytest.fixture
def auth_headers(auth_token):
    """Headers con autorización para peticiones REST"""
    return {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def user1_headers(user1_token):
    """Headers específicos del usuario 1"""
    return {
        'Authorization': f'Bearer {user1_token}',
        'Content-Type': 'application/json'
    }

@pytest.fixture
def user2_headers(user2_token):
    """Headers específicos del usuario 2"""
    return {
        'Authorization': f'Bearer {user2_token}',
        'Content-Type': 'application/json'
    }

# Fixtures async simplificadas - se crearán dinámicamente en los tests que las necesiten

@pytest.fixture
def sample_message_data():
    """Datos de ejemplo para mensajes"""
    return {
        'content': fake.sentence(nb_words=6),
        'type': 'text'
    }

@pytest.fixture
def sample_chat_data():
    """Datos de ejemplo para chats"""
    return {
        'user_ids': ['user1', 'user2'],
        'description': fake.sentence(nb_words=4)
    }

# Utility functions para las pruebas
def wait_for_condition(condition_func, timeout=5, interval=0.1):
    """Esperar hasta que una condición se cumpla"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if condition_func():
            return True
        time.sleep(interval)
    return False

def assert_api_response_structure(response_data, expected_fields):
    """Verificar que la respuesta de la API tenga la estructura esperada"""
    for field in expected_fields:
        assert field in response_data, f"Campo '{field}' faltante en la respuesta"

# Configuración para diferentes tipos de pruebas
@pytest.fixture
def rest_api_config():
    """Configuración para pruebas de API REST"""
    return {
        'base_url': CHAT_SERVICE_BASE,
        'timeout': 10,
        'retry_attempts': 3
    }

@pytest.fixture
def websocket_config():
    """Configuración para pruebas de WebSocket"""
    return {
        'url': WEBSOCKET_URL,
        'connection_timeout': 10,
        'event_timeout': 5,
        'retry_attempts': 3
    } 