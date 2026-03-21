from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_db
from app.models.models import Analysis, EmergencyAlert, Recording, SessionModel
from app.schemas.recording import (
    AnalysisRequest,
    AnalysisResponse,
    RecordingCreate,
    RecordingRead,
    RecordingUploadResponse,
)
from app.services.analysis_service import AnalysisService
from app.services.notification_service import NotificationService
from app.services.storage_service import StorageService


router = APIRouter()


@router.post("", response_model=RecordingUploadResponse, status_code=status.HTTP_201_CREATED)
def create_recording(payload: RecordingCreate, db: DBSession = Depends(get_db)) -> RecordingUploadResponse:
    call = db.get(SessionModel, payload.session_id)
    if call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    storage = StorageService()
    object_key = storage.build_recording_key(call_id=payload.session_id, filename=payload.file_name)
    upload_url = storage.generate_presigned_upload_url(object_key, payload.content_type)

    recording = Recording(
        session_id=payload.session_id,
        file_name=payload.file_name,
        content_type=payload.content_type,
        s3_key=object_key,
        upload_status="pending",
        audio_s3_key=payload.audio_s3_key,
        duration_seconds=payload.duration_seconds,
    )
    db.add(recording)
    db.commit()
    db.refresh(recording)

    return RecordingUploadResponse(
        recording=recording,
        upload_url=upload_url,
        bucket_key=object_key,
    )


@router.post("/{recording_id}/complete", response_model=RecordingRead)
def mark_recording_uploaded(recording_id: int, db: DBSession = Depends(get_db)) -> Recording:
    recording = db.get(Recording, recording_id)
    if recording is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording not found")

    recording.upload_status = "uploaded"
    db.commit()
    db.refresh(recording)
    return recording


@router.post("/{recording_id}/analyze", response_model=AnalysisResponse)
def analyze_recording(recording_id: int, payload: AnalysisRequest, db: DBSession = Depends(get_db)) -> AnalysisResponse:
    recording = db.get(Recording, recording_id)
    if recording is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording not found")

    existing = db.query(Analysis).filter(Analysis.session_id == recording.session_id).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Analysis already exists for this session")

    session_record = db.get(SessionModel, recording.session_id)
    if session_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    analysis_service = AnalysisService()
    notification_service = NotificationService()
    result = analysis_service.analyze_recording(
        recording_s3_key=recording.s3_key,
        transcript=payload.transcript_text,
        notes=payload.notes,
    )

    if payload.transcript_raw is not None:
        session_record.transcript_raw = payload.transcript_raw

    report = Analysis(
        session_id=recording.session_id,
        summary=result["summary"],
        mood_score=result["mood_score"],
        concerns=result["concerns"],
        urgency_level=result["urgency_level"],
        s3_key=recording.s3_key,
    )
    db.add(report)
    emergency_alert = None

    if notification_service.should_notify_emergency_contact(result["urgency_level"]):
        contact = session_record.contact
        senior = contact.senior
        existing_alert = (
            db.query(EmergencyAlert)
            .filter(
                EmergencyAlert.session_id == session_record.id,
                EmergencyAlert.trusted_contact_id == contact.id,
            )
            .first()
        )
        if existing_alert is None:
            concerns = result["concerns"] if isinstance(result["concerns"], list) else [result["urgency_level"]]
            alert_reason = (
                f"Check-in analysis flagged an urgent condition for {senior.name}. "
                f"Summary: {result['summary']} "
                f"Concerns: {', '.join(str(item) for item in concerns)}"
            )
            delivery_status = notification_service.send_emergency_notification(
                recipient_name=contact.name,
                phone_number=contact.phone_number,
                reason=alert_reason,
            )
            emergency_alert = EmergencyAlert(
                senior_id=senior.id,
                trusted_contact_id=contact.id,
                session_id=session_record.id,
                reason=alert_reason,
                delivery_channel="sms",
                delivery_status=delivery_status,
            )
            db.add(emergency_alert)

    db.commit()
    db.refresh(report)
    if emergency_alert is not None:
        db.refresh(emergency_alert)

    return AnalysisResponse(
        id=report.id,
        session_id=report.session_id,
        summary=report.summary,
        mood_score=report.mood_score,
        concerns=report.concerns,
        urgency_level=report.urgency_level,
        s3_key=report.s3_key,
        created_at=report.created_at,
        emergency_alert_sent=emergency_alert is not None,
        emergency_alert_id=emergency_alert.id if emergency_alert is not None else None,
    )
