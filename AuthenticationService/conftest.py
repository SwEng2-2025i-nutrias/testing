import pytest
import requests
import os
from faker import Faker
import random

# Load the url from the environment variable
base_url = os.getenv("AUTHENTICATION_BACKEND", "http://127.0.0.1:5001/auth")
fake = Faker()

# Fixture for eliminating the user database after each test
@pytest.fixture(scope="function", autouse=True)
def clear_user_database():
    # Make the petition to clear the user database
    delete_url = f"{base_url}/__test__/database"

    response = requests.delete(delete_url)
    if response.status_code != 200:
        raise Exception(f"Failed to clear user database: {response.status_code} - {response.text}")
    
    yield  # This will run the test

# Fixture for a valid user
@pytest.fixture(scope="function")
def random_user_payload():
    return {
        "email": fake.unique.email(),
        "name": fake.name(),
        "password": fake.password(length=12),
        "role": random.choice(["farmer", "buyer"])
    }
