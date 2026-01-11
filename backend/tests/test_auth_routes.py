from fastapi.testclient import TestClient
from backend.main import app
from backend.routes.auth_routes import verify_password
import pytest

client = TestClient(app)

def test_signup_success(monkeypatch):
    """Test successful user signup."""
    
    # Mock database calls
    monkeypatch.setattr("backend.routes.auth_routes.users_collection.find_one", lambda *args, **kwargs: None)
    monkeypatch.setattr("backend.routes.auth_routes.users_collection.insert_one", lambda *args, **kwargs: None)

    response = client.post("/auth/signup", json={"email": "test@example.com", "password": "password"})
    
    assert response.status_code == 200
    assert response.json() == {"email": "test@example.com"}

def test_signup_user_exists(monkeypatch):
    """Test signup when user already exists."""
    
    # Mock database to return an existing user
    monkeypatch.setattr("backend.routes.auth_routes.users_collection.find_one", lambda *args, **kwargs: {"email": "test@example.com"})

    response = client.post("/auth/signup", json={"email": "test@example.com", "password": "password"})
    
    assert response.status_code == 400
    assert response.json() == {"detail": "User already exists"}

def test_login_success(monkeypatch):
    """Test successful user login."""
    
    # Mock database to return a user and password verification to return True
    monkeypatch.setattr("backend.routes.auth_routes.users_collection.find_one", lambda *args, **kwargs: {"email": "test@example.com", "password": "hashed_password"})
    monkeypatch.setattr("backend.routes.auth_routes.verify_password", lambda *args, **kwargs: True)

    response = client.post("/auth/login", json={"email": "test@example.com", "password": "password"})
    
    assert response.status_code == 200
    assert response.json() == {"email": "test@example.com"}

def test_login_user_not_found(monkeypatch):
    """Test login when user does not exist."""
    
    # Mock database to return no user
    monkeypatch.setattr("backend.routes.auth_routes.users_collection.find_one", lambda *args, **kwargs: None)

    response = client.post("/auth/login", json={"email": "test@example.com", "password": "password"})
    
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}

def test_login_incorrect_password(monkeypatch):
    """Test login with incorrect password."""
    
    # Mock database to return a user and password verification to return False
    monkeypatch.setattr("backend.routes.auth_routes.users_collection.find_one", lambda *args, **kwargs: {"email": "test@example.com", "password": "hashed_password"})
    monkeypatch.setattr("backend.routes.auth_routes.verify_password", lambda *args, **kwargs: False)

    response = client.post("/auth/login", json={"email": "test@example.com", "password": "wrong_password"})
    
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}
