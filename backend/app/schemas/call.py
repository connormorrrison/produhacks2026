from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class CallCreate(BaseModel):
    contact_id: str
    heygen_session_id: str | None = None


class CallStatusUpdate(BaseModel):
    status: str
    transcript_raw: dict | None = None
    heygen_session_id: str | None = None


class CallRead(ORMModel):
    id: str
    contact_id: str
    heygen_session_id: str | None = None
    status: str
    transcript_raw: dict | None = None
    call_link: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    created_at: datetime


class CallJoinResponse(BaseModel):
    session_id: str
    call_link: str | None = None
    status: str
    avatar_enabled: bool
