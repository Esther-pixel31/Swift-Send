from dotenv import load_dotenv
load_dotenv()
import pytest
from app import create_app
from app.models.base import Base
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.utils.auth import hash_password

@pytest.fixture(scope="session")
def app():
    """Creates a Flask app in testing mode."""
    app = create_app(testing=True)
    yield app

@pytest.fixture(scope="function")
def db_session():
    """Creates a new database session for each test and rolls back after."""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(app):
    """Provides a test client for sending requests."""
    return app.test_client()

@pytest.fixture
def test_user(db_session):
    """Creates a regular user."""
    user = User(
        name="Admin User",
        email="user@example.com",
        hashed_password=hash_password("password123"),
        is_active=True,
        role="user"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)  # ✅ This ensures user is attached
    return user

@pytest.fixture
def admin_user(db_session):
    """Creates an admin user."""
    user = User(
        name="Admin User",
        email="admin@example.com",
        hashed_password=hash_password("admin123"),
        is_active=True,
        role="admin"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)  # ✅ This ensures user is attached
    return user

@pytest.fixture
def frozen_user(db_session):
    """Creates a frozen user."""
    user = User(
        name="Admin User",
        email="frozen@example.com",
        hashed_password=hash_password("frozen123"),
        is_active=False,
        role="user"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)  # ✅ This ensures user is attached
    return user

@pytest.fixture
def auth_headers(client, test_user):
    """Returns auth headers for a logged-in user."""
    res = client.post("/api/auth/login", json={"email": test_user.email, "password": "password123"})
    token = res.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_auth_header(client, admin_user):
    """Returns auth headers for a logged-in admin."""
    res = client.post("/api/auth/login", json={"email": admin_user.email, "password": "admin123"})
    token = res.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


