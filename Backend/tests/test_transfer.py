import pytest

def test_domestic_transfer_success(client, auth_headers, setup_users):
    response = client.post("/api/transfer/domestic", json={
        "recipient_email": setup_users["recipient"].email,
        "amount": 50
    }, headers=auth_headers["sender"])
    assert response.status_code == 200


def test_domestic_transfer_insufficient_balance(client, auth_headers, setup_users):
    response = client.post("/api/transfer/domestic", json={
        "recipient_email": setup_users["recipient"].email,
        "amount": 50000  # Assume balance is less
    }, headers=auth_headers["sender"])
    assert response.status_code == 400


def test_domestic_transfer_user_frozen_after_fraud(client, auth_headers, setup_users):
    # Send a high-value fraudulent tx
    response = client.post("/api/transfer/domestic", json={
        "recipient_email": setup_users["recipient"].email,
        "amount": 1000000
    }, headers=auth_headers["sender"])
    assert response.status_code == 403
    assert "flagged" in response.get_json()["msg"].lower()


def test_domestic_transfer_blocked_for_frozen_user(client, auth_headers, setup_users, freeze_user):
    response = client.post("/api/transfer/domestic", json={
        "recipient_email": setup_users["recipient"].email,
        "amount": 10
    }, headers=auth_headers["frozen"])
    assert response.status_code == 403