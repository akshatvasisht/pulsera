"""Tests for auth, group, and health-related API routes."""

from fastapi.testclient import TestClient


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_me_flow(test_app: TestClient) -> None:
    """End-to-end auth flow: register -> me -> login."""
    client = test_app

    # Register a new user
    resp = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com"},
    )
    assert resp.status_code == 200
    data = resp.json()
    token = data["token"]
    user_id = data["user_id"]

    # /me should return the same user when authorized
    me_resp = client.get("/api/auth/me", headers=_auth_headers(token))
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["user_id"] == user_id
    assert me_data["name"] == "Test User"

    # Login with token should succeed and return same identity
    login_resp = client.post("/api/auth/login", json={"token": token})
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["user_id"] == user_id
    assert login_data["token"] == token


def test_health_latest_and_history_no_data(test_app: TestClient) -> None:
    """Health endpoints should respond gracefully when no data is present."""
    client = test_app

    # Create a user to authorize requests
    reg = client.post("/api/auth/register", json={"name": "Health User"})
    assert reg.status_code == 200
    reg_data = reg.json()
    token = reg_data["token"]
    user_id = reg_data["user_id"]

    # Latest health should return a no_data status
    latest_resp = client.get(
        f"/api/health/{user_id}/latest",
        headers=_auth_headers(token),
    )
    assert latest_resp.status_code == 200
    latest = latest_resp.json()
    assert latest["user_id"] == user_id
    assert latest["status"] in {"no_data", "normal", "elevated", "critical"}

    # History should return an empty list when no readings exist
    history_resp = client.get(
        f"/api/health/{user_id}/history",
        headers=_auth_headers(token),
    )
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert history["user_id"] == user_id
    assert isinstance(history.get("history"), list)


def test_group_create_and_list_flow(test_app: TestClient) -> None:
    """Creating a group should make it appear in the caller's group list."""
    client = test_app

    # Register owner user
    reg = client.post("/api/auth/register", json={"name": "Group Owner"})
    assert reg.status_code == 200
    reg_data = reg.json()
    token = reg_data["token"]

    # Create a new family group
    create_resp = client.post(
        "/api/groups",
        json={"name": "Family Circle", "description": "Test family", "type": "family"},
        headers=_auth_headers(token),
    )
    assert create_resp.status_code == 200
    group = create_resp.json()
    group_id = group["id"]
    assert group["name"] == "Family Circle"
    assert group["member_count"] == 1

    # List groups should include the new group
    list_resp = client.get("/api/groups", headers=_auth_headers(token))
    assert list_resp.status_code == 200
    groups = list_resp.json()
    assert any(g["id"] == group_id for g in groups)

    # Fetch group detail and pulse summary
    detail_resp = client.get(f"/api/groups/{group_id}", headers=_auth_headers(token))
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == group_id
    assert detail["name"] == "Family Circle"

    pulse_resp = client.get(f"/api/groups/{group_id}/pulse", headers=_auth_headers(token))
    assert pulse_resp.status_code == 200
    pulse = pulse_resp.json()
    assert pulse["group_id"] == group_id
    assert pulse["group_type"] in {"family", "community"}

