from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.medical_image import MedicalImage
from app.schemas.medical_record import MedicalRecordRead


class PatientProfile(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    created_at: datetime
    medical_records: list
    medical_images: list

    class Config:
        orm_mode = True


class PatientProfileOwn(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    created_at: datetime
    medical_records: list[MedicalRecordRead]
    medical_images: list[MedicalImage]


class PatientRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    clinic_id: int
