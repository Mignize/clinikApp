from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class MedicalRecord(SQLModel, table=True):
    __tablename__ = "medical_record"
    id: int = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="user.id")
    doctor_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(default=None, max_length=500)