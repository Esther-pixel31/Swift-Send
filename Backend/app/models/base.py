from sqlalchemy.orm import declarative_base

Base = declarative_base()

class SerializationMixin:
    def serialize(self):
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
