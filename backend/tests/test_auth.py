import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200

def test_register():
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepass123"
    })
    assert response.status_code == 201
    assert "access_token" in response.json()

def test_login():
    client.post("/api/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "pass123"
    })
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "pass123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401