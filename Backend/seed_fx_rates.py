# seed_fx_rates.py
from app.db.session import SessionLocal
from app.models.fx_rate import FXRate

session = SessionLocal()

rates = [
    FXRate(base_currency="USD", target_currency="KES", rate=145.00),
    FXRate(base_currency="EUR", target_currency="USD", rate=1.10),
    FXRate(base_currency="USD", target_currency="EUR", rate=0.91),
]

session.add_all(rates)
session.commit()
session.close()
print("FX rates seeded.")
