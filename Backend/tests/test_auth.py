import pytest
from app.models.user import User

def test_login_success(client, db_session):
    # Setup test user
    user = User(email="test@example.com")
    user.set_password("securepass")
    db_session.add(user)
    db_session.commit()

    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "securepass"
    })
    assert response.status_code == 200
    assert "access_token" in response.get_json()

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "bad@example.com",
        "password": "wrong"
    })
    assert response.status_code == 401

def test_login_frozen_user(client, db_session):
    user = User(email="frozen@example.com", is_active=False)
    user.set_password("pass")
    db_session.add(user)
    db_session.commit()

    response = client.post("/api/auth/login", json={
        "email": "frozen@example.com",
        "password": "pass"
    })
    assert response.status_code == 403
    assert "frozen" in response.get_json()["msg"].lower()
