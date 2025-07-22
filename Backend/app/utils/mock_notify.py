from datetime import datetime

def send_mock_notification(user_id, message):
    print(f"[MOCK NOTIFICATION] ({datetime.utcnow().isoformat()}) -> User {user_id}: {message}")
