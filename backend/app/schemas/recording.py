from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel, TimestampedORMModel


class RecordingCreate(BaseModel):
    session_id: str
    file_name: str
    content_type: str
    duration_seconds: float | None = None
    audio_s3_key: str | None = None


class RecordingRead(TimestampedORMModel):
    session_id: str
    file_name: str
    content_type: str
    s3_key: str
    audio_s3_key: str | None = None
    duration_seconds: float | None = None
    upload_status: str


class RecordingUploadResponse(BaseModel):
    recording: RecordingRead
    upload_url: str
    bucket_key: str


class AnalysisRequest(BaseModel):
    transcript_raw: dict | None = None
    transcript_text: str | None = None
    notes: str | None = None


class AnalysisResponse(ORMModel):
    id: str
    session_id: str
    summary: str
    mood_score: int | None = None
    concerns: dict | list | None = None
    urgency_level: str
    s3_key: str | None = None
    created_at: datetime | None = None
    emergency_alert_sent: bool = False
    emergency_alert_id: int | None = None
