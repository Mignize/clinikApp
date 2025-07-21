from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class MedicalRecord(SQLModel, table=True):  # type: ignore[misc, call-arg]
    __tablename__ = "medical_record"
    id: int = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="user.id")
    doctor_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default=None, max_length=500)
    diagnosis: Optional[str] = Field(default=None, max_length=500)
    symptoms: Optional[str] = Field(default=None, max_length=500)
    treatment: Optional[str] = Field(default=None, max_length=500)
