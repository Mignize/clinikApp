from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PatientProfile(BaseModel):
    id: int
    full_name: Optional[str]
    email: str
    created_at: datetime
    medical_records: list
    medical_images: list

    class Config:
        orm_mode = True
