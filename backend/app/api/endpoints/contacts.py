from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.api.deps import get_db
from app.models.models import Contact, SeniorProfile
from app.schemas.contact import ContactCreate, ContactRead, SeniorProfileCreate, SeniorProfileRead


router = APIRouter()


@router.post("/profiles", response_model=SeniorProfileRead, status_code=status.HTTP_201_CREATED)
def create_senior_profile(payload: SeniorProfileCreate, db: DBSession = Depends(get_db)) -> SeniorProfile:
    profile = SeniorProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_trusted_contact(payload: ContactCreate, db: DBSession = Depends(get_db)) -> Contact:
    senior = db.get(SeniorProfile, payload.senior_id)
    if senior is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Senior profile not found")

    contact = Contact(**payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/profiles/{senior_id}", response_model=SeniorProfileRead)
def get_senior_profile(senior_id: int, db: DBSession = Depends(get_db)) -> SeniorProfile:
    senior = db.get(SeniorProfile, senior_id)
    if senior is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Senior profile not found")
    return senior
