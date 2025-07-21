from datetime import datetime

def enforce_spending_limit(wallet, amount):
    now = datetime.utcnow()

    if not wallet.last_spending_reset or wallet.last_spending_reset.date() != now.date():
        wallet.daily_spent = 0
        
        if not wallet.last_spending_reset or wallet.last_spending_reset.month != now.month:
            wallet.monthly_spent = 0
        wallet.last_spending_reset = now

    projected_daily = wallet.daily_spent + amount
    projected_monthly = wallet.monthly_spent + amount

    if wallet.daily_limit and projected_daily > wallet.daily_limit:
        return False, "Daily spending limit exceeded"
    
    if wallet.monthly_limit and projected_monthly > wallet.monthly_limit:
        return False, "Monthly spending limit exceeded"

    if wallet.budget and projected_monthly > wallet.budget:
        return False, "Overall wallet budget exceeded"
   
    wallet.daily_spent = projected_daily
    wallet.monthly_spent = projected_monthly
    wallet.last_spending_reset = now

    return True, None
