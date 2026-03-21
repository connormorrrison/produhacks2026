from pydantic import BaseModel

from app.schemas.common import TimestampedORMModel


class EmergencyAlertCreate(BaseModel):
    senior_id: int
    trusted_contact_id: str
    session_id: str | None = None
    reason: str
    delivery_channel: str = "sms"


class EmergencyAlertRead(TimestampedORMModel):
    senior_id: int
    trusted_contact_id: str
    session_id: str | None = None
    reason: str
    delivery_channel: str
    delivery_status: str
