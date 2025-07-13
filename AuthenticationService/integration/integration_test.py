from pytest import mark
import requests
from AuthenticationService.conftest import base_url

@mark.integration
def test_register_user_success(random_user_payload):
    """
    Test to register a user successfully.
    """
    payload = random_user_payload
    response = requests.post(f"{base_url}/register", json=payload)

    response_json = response.json()
    
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
    assert "id" in response_json, "Response should contain id"
    assert response_json["email"] == payload["email"], "Email in response should match the payload"
    assert response_json["name"] == payload["name"], "Name in response should match the payload"
    assert response_json["role"] == payload["role"], "Role in response should match the payload"


@mark.integration
def test_register_user_duplicate_email(random_user_payload):
    """
    Test to register a user with a duplicate email.
    """
    payload = random_user_payload
    # First registration should succeed
    response = requests.post(f"{base_url}/register", json=payload)
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    # Second registration with the same email should fail
    response = requests.post(f"{base_url}/register", json=payload)
    assert response.status_code == 400, f"Expected status code 400, got {response.status_code}"
    response_text = response.text.lower()
    assert "user already exists with this email" in response_text, "Response should indicate email already exists"

@mark.integration
def test_register_and_login(random_user_payload):
    """
    Test to register a user and then log in with the same credentials.
    """
    payload = random_user_payload
    # Register the user
    response = requests.post(f"{base_url}/register", json=payload)
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    # Log in with the same credentials
    login_response = requests.post(f"{base_url}/login", json={
        "email": payload["email"],
        "password": payload["password"]
    })

    assert login_response.status_code == 200, f"Expected status code 200, got {login_response.status_code}"
    login_response_json = login_response.json()
    
    assert "token" in login_response_json, "Response should contain an authentication token"
    assert login_response_json["user"]["email"] == payload["email"], "Email in response should match the registered email"

@mark.integration
def test_login_invalid_credentials(random_user_payload):
    """
    Test to log in with invalid credentials.
    """
    payload = random_user_payload
    # Register the user first
    response = requests.post(f"{base_url}/register", json=payload)
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    wrong_password = payload["password"] + "wrong"

    # Attempt to log in with incorrect password
    login_response = requests.post(f"{base_url}/login", json={
        "email": payload["email"],
        "password": wrong_password
    })

    assert login_response.status_code == 400, f"Expected status code 400, got {login_response.status_code}"

@mark.integration
def test_validate_token_success(random_user_payload):
    """
    Test to validate a token successfully.
    """
    payload = random_user_payload
    # Register the user first
    response = requests.post(f"{base_url}/register", json=payload)
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    # Obtain the user id for validation
    response_json = response.json()
    user_id = response_json["id"]

    # Log in to get the token
    login_response = requests.post(f"{base_url}/login", json={
        "email": payload["email"],
        "password": payload["password"]
    })
    
    assert login_response.status_code == 200, f"Expected status code 200, got {login_response.status_code}"
    token = login_response.json()["token"]

    # Validate the token
    validate_response = requests.get(f"{base_url}/validate-token", headers={"Authorization": f"Bearer {token}"})
    
    assert validate_response.status_code == 200, f"Expected status code 200, got {validate_response.status_code}"
    validate_response_json = validate_response.json()
    assert validate_response_json["user_id"] == user_id, "Id in response should match the registered user id"

@mark.integration
def test_get_user_by_id(random_user_payload):
    """
    Test to get a user by ID.
    """
    payload = random_user_payload
    # Register the user first
    response = requests.post(f"{base_url}/register", json=payload)
    assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"

    response_json = response.json()
    user_id = response_json["id"]

    # Get the user by ID
    user_response = requests.get(f"{base_url}/users/{user_id}")
    
    assert user_response.status_code == 200, f"Expected status code 200, got {user_response.status_code}"
    user_response_json = user_response.json()
    
    assert user_response_json["id"] == user_id, "Id in response should match the registered user id"
    assert user_response_json["email"] == payload["email"], "Email in response should match the registered email"