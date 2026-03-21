from fastapi import APIRouter

from app.api.endpoints import calls, contacts, dashboard, emergencies, recordings


api_router = APIRouter()
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(calls.router, prefix="/calls", tags=["calls"])
api_router.include_router(recordings.router, prefix="/recordings", tags=["recordings"])
api_router.include_router(emergencies.router, prefix="/emergencies", tags=["emergencies"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
