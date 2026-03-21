from app.schemas.call import CallRead
from app.schemas.contact import ContactRead
from app.schemas.emergency import EmergencyAlertRead
from app.schemas.contact import SeniorProfileRead
from app.schemas.recording import AnalysisResponse, RecordingRead
from pydantic import BaseModel


class CaretakerDashboard(BaseModel):
    senior: SeniorProfileRead
    contact: ContactRead | None = None
    total_sessions: int
    completed_sessions: int
    alerts_sent: int
    recent_sessions: list[CallRead]
    recent_recordings: list[RecordingRead]
    recent_analyses: list[AnalysisResponse]
    recent_alerts: list[EmergencyAlertRead]
