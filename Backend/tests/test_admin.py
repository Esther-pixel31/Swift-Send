import pytest

def test_admin_can_view_fraud_logs(client, admin_auth_header):
    response = client.get("/api/admin/fraud/logs", headers=admin_auth_header)
    assert response.status_code == 200


def test_non_admin_cannot_view_fraud_logs(client, auth_headers):
    response = client.get("/api/admin/fraud/logs", headers=auth_headers)
    assert response.status_code == 403


def test_admin_can_reactivate_user(client, admin_user):
    response = client.post(f"/api/admin/reactivate/{admin_user}")



def test_admin_reactivate_invalid_user(client, admin_auth_header):
    response = client.post("/api/admin/users/9999/reactivate", headers=admin_auth_header)
    assert response.status_code == 404
