from pydantic import BaseModel, EmailStr

class TransferSchema(BaseModel):
    receiver_email: EmailStr
    amount: float
