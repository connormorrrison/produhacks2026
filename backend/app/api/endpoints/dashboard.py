from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_db
from app.models.models import Analysis, Contact, EmergencyAlert, Recording, SeniorProfile, SessionModel
from app.schemas.dashboard import CaretakerDashboard


router = APIRouter()


@router.get("/{senior_id}", response_model=CaretakerDashboard)
def get_dashboard(senior_id: int, db: DBSession = Depends(get_db)) -> CaretakerDashboard:
    senior = db.get(SeniorProfile, senior_id)
    if senior is None:
        raise HTTPException(status_code=404, detail="Senior profile not found")

    total_calls = (
        db.query(func.count(SessionModel.id))
        .join(Contact, SessionModel.contact_id == Contact.id)
        .filter(Contact.senior_id == senior_id)
        .scalar()
        or 0
    )
    completed_calls = (
        db.query(func.count(SessionModel.id))
        .join(Contact, SessionModel.contact_id == Contact.id)
        .filter(Contact.senior_id == senior_id, SessionModel.status == "completed")
        .scalar()
        or 0
    )
    alerts_sent = db.query(func.count(EmergencyAlert.id)).filter(EmergencyAlert.senior_id == senior_id).scalar() or 0

    recent_recordings = (
        db.query(Recording)
        .join(SessionModel, Recording.session_id == SessionModel.id)
        .join(Contact, SessionModel.contact_id == Contact.id)
        .filter(Contact.senior_id == senior_id)
        .order_by(Recording.created_at.desc())
        .limit(10)
        .all()
    )
    recent_analyses = (
        db.query(Analysis)
        .join(SessionModel, Analysis.session_id == SessionModel.id)
        .join(Contact, SessionModel.contact_id == Contact.id)
        .filter(Contact.senior_id == senior_id)
        .order_by(Analysis.created_at.desc())
        .limit(10)
        .all()
    )
    recent_calls = (
        db.query(SessionModel)
        .join(Contact, SessionModel.contact_id == Contact.id)
        .filter(Contact.senior_id == senior_id)
        .order_by(SessionModel.created_at.desc())
        .limit(10)
        .all()
    )
    recent_alerts = (
        db.query(EmergencyAlert)
        .filter(EmergencyAlert.senior_id == senior_id)
        .order_by(EmergencyAlert.created_at.desc())
        .limit(10)
        .all()
    )

    return CaretakerDashboard(
        senior=senior,
        contact=None,
        total_sessions=total_calls,
        completed_sessions=completed_calls,
        alerts_sent=alerts_sent,
        recent_sessions=recent_calls,
        recent_recordings=recent_recordings,
        recent_analyses=recent_analyses,
        recent_alerts=recent_alerts,
    )


@router.get("/contact/{contact_id}", response_model=CaretakerDashboard)
def get_contact_dashboard(contact_id: str, db: DBSession = Depends(get_db)) -> CaretakerDashboard:
    contact = db.get(Contact, contact_id)
    if contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    senior = db.get(SeniorProfile, contact.senior_id)
    if senior is None:
        raise HTTPException(status_code=404, detail="Senior profile not found")

    total_sessions = db.query(func.count(SessionModel.id)).filter(SessionModel.contact_id == contact_id).scalar() or 0
    completed_sessions = (
        db.query(func.count(SessionModel.id))
        .filter(SessionModel.contact_id == contact_id, SessionModel.status == "completed")
        .scalar()
        or 0
    )
    alerts_sent = (
        db.query(func.count(EmergencyAlert.id))
        .filter(EmergencyAlert.trusted_contact_id == contact_id)
        .scalar()
        or 0
    )
    recent_sessions = (
        db.query(SessionModel)
        .filter(SessionModel.contact_id == contact_id)
        .order_by(SessionModel.created_at.desc())
        .limit(10)
        .all()
    )
    recent_recordings = (
        db.query(Recording)
        .join(SessionModel, Recording.session_id == SessionModel.id)
        .filter(SessionModel.contact_id == contact_id)
        .order_by(Recording.created_at.desc())
        .limit(10)
        .all()
    )
    recent_analyses = (
        db.query(Analysis)
        .join(SessionModel, Analysis.session_id == SessionModel.id)
        .filter(SessionModel.contact_id == contact_id)
        .order_by(Analysis.created_at.desc())
        .limit(10)
        .all()
    )
    recent_alerts = (
        db.query(EmergencyAlert)
        .filter(EmergencyAlert.trusted_contact_id == contact_id)
        .order_by(EmergencyAlert.created_at.desc())
        .limit(10)
        .all()
    )

    return CaretakerDashboard(
        senior=senior,
        contact=contact,
        total_sessions=total_sessions,
        completed_sessions=completed_sessions,
        alerts_sent=alerts_sent,
        recent_sessions=recent_sessions,
        recent_recordings=recent_recordings,
        recent_analyses=recent_analyses,
        recent_alerts=recent_alerts,
    )
