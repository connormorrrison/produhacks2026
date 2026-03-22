from pydantic import BaseModel, EmailStr

from app.schemas.common import TimestampedORMModel


class SeniorProfileCreate(BaseModel):
    name: str
    phone_number: str
    age: int | None = None
    notes: str | None = None


class SeniorProfileRead(TimestampedORMModel):
    name: str
    phone_number: str
    age: int | None = None
    notes: str | None = None


class ContactCreate(BaseModel):
    senior_id: int
    name: str
    relationship_to_senior: str
    phone_number: str
    email: EmailStr | None = None


class ContactRead(TimestampedORMModel):
    senior_id: int
    name: str
    relationship_to_senior: str
    phone_number: str
    email: EmailStr | None = None
