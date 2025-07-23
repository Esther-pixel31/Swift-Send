from datetime import datetime
from ..models.fraud_rule import FraudRule
from ..models.transaction import Transaction

def get_fraud_rules(session):
    rules = session.query(FraudRule).filter_by(active=True).all()
    return {rule.key: float(rule.value) for rule in rules}

def is_transaction_suspicious(user, amount, session):
    reasons = []

    rules = get_fraud_rules(session)

    # 1. High-value transaction check
    if amount > rules.get("max_tx_amount", float("inf")):
        reasons.append("High-value transaction")

    # 2. Transactions in the past minute
    one_minute_ago = datetime.utcnow().timestamp() - 60
    recent_count = session.query(Transaction).filter(
        Transaction.user_id == user.id,
        Transaction.created_at > datetime.utcfromtimestamp(one_minute_ago)
    ).count()

    if recent_count > rules.get("max_tx_per_min", 100):
        reasons.append("Too many transactions in a short period")

    # 3. Minimum account age check
    account_age_minutes = (datetime.utcnow() - user.created_at).total_seconds() / 60
    if account_age_minutes < rules.get("min_user_age_min", 0):
        reasons.append("User account too new to transfer")

    return bool(reasons), reasons
