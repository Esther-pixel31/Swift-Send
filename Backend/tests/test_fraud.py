import pytest
from app.utils.fraud_rules import is_transaction_suspicious

def test_fraud_detection_high_value(db_session, user_with_wallet):
    suspicious, reasons = is_transaction_suspicious(user_with_wallet, 1000000, [], db_session)
    assert suspicious
    assert any("high-value" in r.lower() for r in reasons)


def test_fraud_detection_new_user_age(db_session, new_user):
    suspicious, reasons = is_transaction_suspicious(new_user, 10, [], db_session)
    assert suspicious
    assert any("too new" in r.lower() for r in reasons)