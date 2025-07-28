from werkzeug.security import generate_password_hash
from app.db.session import SessionLocal
from app.models.user import User

session = SessionLocal()

admin = session.query(User).filter_by(email="admin@swift.com").first()

if admin:
    new_password = "Wanza2025#@!"  # ✅ Set your new admin password here
    admin.hashed_password = generate_password_hash(new_password)
    session.commit()
    print("✅ Admin password updated successfully")
else:
    print("❌ Admin not found")

session.close()
