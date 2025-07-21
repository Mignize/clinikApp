from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MedicalRecordCreate(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    notes: Optional[str] = None
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    treatment: Optional[str] = None


class MedicalRecordRead(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    created_at: datetime
    updated_at: datetime
    notes: Optional[str]
    diagnosis: Optional[str]
    symptoms: Optional[str]
    treatment: Optional[str]

    class Config:
        orm_mode = True


class MedicalImageRead(BaseModel):
    id: int
    record_id: int
    image_type: str
    image_url: str
    upload_at: datetime
    description: Optional[str]

    class Config:
        orm_mode = True
