from pydantic import BaseModel, EmailStr, constr, condecimal
from typing import Optional
from decimal import Decimal

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: constr(min_length=6)


class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TransferSchema(BaseModel):
    receiver_email: EmailStr
    amount: condecimal(gt=0)
    currency: str
    note: Optional[str]
