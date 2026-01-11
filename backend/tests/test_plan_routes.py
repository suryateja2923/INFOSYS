from fastapi.testclient import TestClient
from backend.main import app
import pytest

client = TestClient(app)

@pytest.fixture
def plan_request_payload():
    return {
        "email": "test@example.com",
        "age": 30,
        "gender": "male",
        "height": 180,
        "weight": 80,
        "fitness_level": "intermediate",
        "diet_type": "balanced",
        "goal": "build muscle",
        "pregnant": False,
        "pregnancy_month": None
    }

def test_generate_plan_success(monkeypatch, plan_request_payload):
    """Test successful fitness plan generation."""
    
    # Mock database to return a user
    monkeypatch.setattr("backend.routes.plan_routes.users_collection.find_one", lambda *args, **kwargs: {"email": "test@example.com"})
    # Mock Gemini service to return a plan
    monkeypatch.setattr("backend.routes.plan_routes.generate_plan_with_gemini", lambda *args, **kwargs: {"plan": "This is a test plan."})
    # Mock database update
    monkeypatch.setattr("backend.routes.plan_routes.users_collection.update_one", lambda *args, **kwargs: None)

    response = client.post("/plan/generate", json=plan_request_payload)
    
    assert response.status_code == 200
    assert response.json() == {"plan": "This is a test plan."}

def test_generate_plan_user_not_found(monkeypatch, plan_request_payload):
    """Test plan generation when user is not found."""
    
    # Mock database to return no user
    monkeypatch.setattr("backend.routes.plan_routes.users_collection.find_one", lambda *args, **kwargs: None)

    response = client.post("/plan/generate", json=plan_request_payload)
    
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found"}

def test_get_saved_plan_success(monkeypatch):
    """Test successfully retrieving a saved plan."""
    
    # Mock database to return a user with a saved plan
    monkeypatch.setattr("backend.routes.plan_routes.users_collection.find_one", lambda *args, **kwargs: {"email": "test@example.com", "fitness_plan": {"plan": "This is a saved plan."}})

    response = client.get("/plan/saved/test@example.com")
    
    assert response.status_code == 200
    assert response.json() == {"plan": "This is a saved plan."}

def test_get_saved_plan_not_found(monkeypatch):
    """Test retrieving a saved plan when none exists."""
    
    # Mock database to return a user without a saved plan
    monkeypatch.setattr("backend.routes.plan_routes.users_collection.find_one", lambda *args, **kwargs: {"email": "test@example.com"})

    response = client.get("/plan/saved/test@example.com")
    
    assert response.status_code == 404
    assert response.json() == {"detail": "No saved plan"}
