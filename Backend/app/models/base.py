from sqlalchemy.orm import declarative_base
from decimal import Decimal
from datetime import datetime

Base = declarative_base()

class SerializationMixin:
    def serialize(self):
        serialized = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, Decimal):
                serialized[column.name] = float(value)
            elif isinstance(value, datetime):
                serialized[column.name] = value.isoformat()
            else:
                serialized[column.name] = value
        return serialized
