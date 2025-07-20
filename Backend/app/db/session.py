# app/db/session.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# You can move this to your config later
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cashie_user:167519@localhost:5432/cashie_dev")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
