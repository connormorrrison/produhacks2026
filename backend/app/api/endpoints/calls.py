from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_db
from app.core.config import settings
from app.models.models import Contact, SessionModel
from app.schemas.call import CallCreate, CallJoinResponse, CallRead, CallStatusUpdate
from app.services.notification_service import NotificationService


router = APIRouter()


@router.post("", response_model=CallRead, status_code=status.HTTP_201_CREATED)
def create_call(payload: CallCreate, db: DBSession = Depends(get_db)) -> SessionModel:
    contact = db.get(Contact, payload.contact_id)
    if contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    session_id = str(uuid4())
    call_link = f"{settings.frontend_base_url}/call/{session_id}"
    notification_service = NotificationService()
    notification_service.send_call_invite(
        recipient_name=contact.name,
        phone_number=contact.phone_number,
        join_url=call_link,
    )
    call = SessionModel(
        id=session_id,
        contact_id=payload.contact_id,
        heygen_session_id=payload.heygen_session_id,
        status="pending",
        call_link=call_link,
    )
    db.add(call)
    db.commit()
    db.refresh(call)
    return call


@router.get("/join/{session_id}", response_model=CallJoinResponse)
def join_call(session_id: str, db: DBSession = Depends(get_db)) -> CallJoinResponse:
    call = db.get(SessionModel, session_id)
    if call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite link is invalid")

    if call.started_at is None:
        call.started_at = datetime.utcnow()
        call.status = "in_progress"
        db.commit()
        db.refresh(call)

    return CallJoinResponse(
        session_id=call.id,
        call_link=call.call_link,
        status=call.status,
        avatar_enabled=False,
    )


@router.patch("/{call_id}", response_model=CallRead)
def update_call_status(call_id: str, payload: CallStatusUpdate, db: DBSession = Depends(get_db)) -> SessionModel:
    call = db.get(SessionModel, call_id)
    if call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    call.status = payload.status
    if payload.status == "completed" and call.ended_at is None:
        call.ended_at = datetime.utcnow()
    if payload.transcript_raw is not None:
        call.transcript_raw = payload.transcript_raw
    if payload.heygen_session_id is not None:
        call.heygen_session_id = payload.heygen_session_id
    db.commit()
    db.refresh(call)
    return call
