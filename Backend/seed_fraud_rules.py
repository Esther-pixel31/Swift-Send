# seed_fraud_rules.py

from app.db.session import SessionLocal
from app.models.fraud_rule import FraudRule

# Define your initial fraud rules
initial_rules = [
    {
        "name": "Max Transfer Amount",
        "description": "Max amount allowed per transaction",
        "key": "max_tx_amount",
        "value": "10000",  # Store as string if your column is VARCHAR
        "active": True
    },
    {
        "name": "Transfers Per Minute",
        "description": "Max transfers allowed per minute",
        "key": "max_tx_per_min",
        "value": "3",
        "active": True
    },
    {
        "name": "Minimum Account Age",
        "description": "Minimum account age in minutes to transfer",
        "key": "min_user_age_min",
        "value": "60",
        "active": True
    }
]

def seed_fraud_rules():
    session = SessionLocal()
    try:
        for rule in initial_rules:
            exists = session.query(FraudRule).filter_by(key=rule["key"]).first()
            if not exists:
                session.add(FraudRule(**rule))
        session.commit()
        print("✅ Fraud rules seeded successfully.")
    except Exception as e:
        session.rollback()
        print("❌ Error seeding fraud rules:", e)
    finally:
        session.close()

if __name__ == "__main__":
    seed_fraud_rules()
