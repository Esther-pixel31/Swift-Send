def get_fraud_rules(session):
    rules = session.query(FraudRule).filter_by(active=True).all()
    return {rule.parameter: rule.threshold for rule in rules}

def is_transaction_suspicious(user, amount, recent_transactions, session):
    from datetime import datetime, timedelta
    reasons = []

    rules = get_fraud_rules(session)

    if amount > rules.get("max_amount", float("inf")):
        reasons.append("High-value transaction")

    tx_count = len([
        tx for tx in recent_transactions
        if (datetime.utcnow() - tx.created_at).total_seconds() < 60
    ])
    if tx_count > rules.get("max_tx_per_minute", 100):
        reasons.append("Too many quick transactions")

    if (datetime.utcnow() - user.created_at).total_seconds() < (rules.get("min_age_minutes", 0) * 60):
        reasons.append("New user transferring too soon")

    return bool(reasons), reasons
