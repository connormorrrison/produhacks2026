from datetime import datetime
from uuid import uuid4

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SeniorProfile(TimestampMixin, Base):
    __tablename__ = "senior_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    phone_number: Mapped[str] = mapped_column(String(32))
    age: Mapped[int | None]
    notes: Mapped[str | None] = mapped_column(Text)

    contacts: Mapped[list["Contact"]] = relationship(back_populates="senior", cascade="all, delete-orphan")
    alerts: Mapped[list["EmergencyAlert"]] = relationship(back_populates="senior", cascade="all, delete-orphan")


class Contact(TimestampMixin, Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    senior_id: Mapped[int] = mapped_column(ForeignKey("senior_profiles.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    relationship_to_senior: Mapped[str] = mapped_column(String(100))
    phone_number: Mapped[str] = mapped_column(String(32))
    email: Mapped[str | None] = mapped_column(String(255))

    senior: Mapped["SeniorProfile"] = relationship(back_populates="contacts")
    sessions: Mapped[list["SessionModel"]] = relationship(back_populates="contact", cascade="all, delete-orphan")
    alerts: Mapped[list["EmergencyAlert"]] = relationship(back_populates="trusted_contact")


class SessionModel(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"), index=True)
    heygen_session_id: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    transcript_raw: Mapped[dict | None] = mapped_column(JSON)
    call_link: Mapped[str | None] = mapped_column(String(500))
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    contact: Mapped["Contact"] = relationship(back_populates="sessions")
    recording: Mapped["Recording"] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    analysis: Mapped["Analysis"] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        uselist=False,
    )
    alerts: Mapped[list["EmergencyAlert"]] = relationship(back_populates="session")


class Recording(TimestampMixin, Base):
    __tablename__ = "recordings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), index=True)
    file_name: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))
    s3_key: Mapped[str] = mapped_column(String(500), unique=True)
    audio_s3_key: Mapped[str | None] = mapped_column(String(500))
    duration_seconds: Mapped[float | None] = mapped_column(Float)
    upload_status: Mapped[str] = mapped_column(String(50), default="pending")

    session: Mapped["SessionModel"] = relationship(back_populates="recording")


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    session_id: Mapped[str] = mapped_column(ForeignKey("sessions.id"), unique=True, index=True)
    summary: Mapped[str] = mapped_column(Text)
    mood_score: Mapped[int | None]
    concerns: Mapped[dict | list | None] = mapped_column(JSON)
    urgency_level: Mapped[str] = mapped_column(String(50), default="normal")
    s3_key: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped["SessionModel"] = relationship(back_populates="analysis")


class EmergencyAlert(TimestampMixin, Base):
    __tablename__ = "emergency_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    senior_id: Mapped[int] = mapped_column(ForeignKey("senior_profiles.id"), index=True)
    trusted_contact_id: Mapped[str] = mapped_column(ForeignKey("contacts.id"), index=True)
    session_id: Mapped[str | None] = mapped_column(ForeignKey("sessions.id"), index=True)
    reason: Mapped[str] = mapped_column(Text)
    delivery_channel: Mapped[str] = mapped_column(String(50), default="sms")
    delivery_status: Mapped[str] = mapped_column(String(50), default="queued")
    sent_at: Mapped[datetime | None] = mapped_column(DateTime)

    senior: Mapped["SeniorProfile"] = relationship(back_populates="alerts")
    trusted_contact: Mapped["Contact"] = relationship(back_populates="alerts")
    session: Mapped["SessionModel"] = relationship(back_populates="alerts")
