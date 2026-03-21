from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_db
from app.models.models import Contact, EmergencyAlert, SeniorProfile, SessionModel
from app.schemas.emergency import EmergencyAlertCreate, EmergencyAlertRead
from app.services.notification_service import NotificationService


router = APIRouter()


@router.post("", response_model=EmergencyAlertRead, status_code=status.HTTP_201_CREATED)
def create_emergency_alert(payload: EmergencyAlertCreate, db: DBSession = Depends(get_db)) -> EmergencyAlert:
    senior = db.get(SeniorProfile, payload.senior_id)
    contact = db.get(Contact, payload.trusted_contact_id)
    call = db.get(SessionModel, payload.session_id) if payload.session_id else None
    if senior is None or contact is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Senior profile or trusted contact not found")
    if call is None and payload.session_id is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    notifier = NotificationService()
    delivery_status = notifier.send_emergency_notification(
        recipient_name=contact.name,
        phone_number=contact.phone_number,
        reason=payload.reason,
    )

    alert = EmergencyAlert(
        senior_id=payload.senior_id,
        trusted_contact_id=payload.trusted_contact_id,
        session_id=payload.session_id,
        reason=payload.reason,
        delivery_channel=payload.delivery_channel,
        delivery_status=delivery_status,
        sent_at=datetime.utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
