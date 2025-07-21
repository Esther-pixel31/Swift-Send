from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from ..db.session import SessionLocal
from ..models.scheduled_transfer import ScheduledTransfer
from ..models.wallet import Wallet
from ..models.transaction import Transaction
from ..utils.mock_notify import send_mock_notification


def run_scheduled_transfers():
    session = SessionLocal()
    now = datetime.utcnow()

    try:
        transfers = session.query(ScheduledTransfer)\
            .filter(ScheduledTransfer.is_active == True, ScheduledTransfer.scheduled_at <= now)\
            .all()

        for tx in transfers:
            wallet = session.query(Wallet).filter_by(user_id=tx.user_id).first()
            
            if wallet and wallet.balance >= tx.amount:
                wallet.balance -= tx.amount

                txn = Transaction(
                    user_id=tx.user_id,
                    beneficiary_id=tx.beneficiary_id,
                    amount=tx.amount,
                    transaction_type="scheduled_transfer",
                    status="success",
                    currency=tx.currency
                )

                session.add(txn)

                tx.status = "processed"
                send_mock_notification(tx.user_id, f"Scheduled transfer of {tx.amount} {tx.currency} sent successfully.")

                if tx.recurrence:
                    if tx.recurrence == "daily":
                        tx.scheduled_at += timedelta(days=1)
                    elif tx.recurrence == "weekly":
                        tx.scheduled_at += timedelta(weeks=1)
                    elif tx.recurrence == "monthly":
                        tx.scheduled_at += relativedelta(months=1)
                else:
                    tx.is_active = False  # one-time, deactivate
            else:
                tx.status = "failed"
                send_mock_notification(tx.user_id, f"Scheduled transfer of {tx.amount} {tx.currency} failed due to insufficient funds.")

            tx.last_attempt_at = now
            session.add(tx)

        session.commit()

    except Exception as e:
        print("Scheduled transfer error:", e)
        session.rollback()
    finally:
        session.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_scheduled_transfers, 'interval', minutes=1)
    scheduler.start()
