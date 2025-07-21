from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

FERNET_KEY = os.getenv("FERNET_SECRET_KEY")

if not FERNET_KEY:
    raise ValueError("FERNET_SECRET_KEY is missing from the environment.")

fernet = Fernet(FERNET_KEY.encode())

def encrypt_data(plain_text: str) -> str:
    """Encrypts plain text into a secure string."""
    return fernet.encrypt(plain_text.encode()).decode()

def decrypt_data(encrypted_text: str) -> str:
    """Decrypts encrypted string back to plain text."""
    return fernet.decrypt(encrypted_text.encode()).decode()
