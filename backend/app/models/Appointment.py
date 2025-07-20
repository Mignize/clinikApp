from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Appointment(SQLModel, table=True):  # type: ignore[misc, call-arg]
    __tablename__ = "appointment"
    id: int = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="user.id")
    doctor_id: int = Field(foreign_key="user.id")
    appointment_date: datetime
    status: str = Field(default="scheduled", max_length=20)
    reason: str = Field(default=None, max_length=255)
    notes: Optional[str] = None
