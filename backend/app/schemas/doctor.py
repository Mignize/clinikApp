from datetime import datetime
from typing import List

from pydantic import BaseModel


class DoctorAvailability(BaseModel):
    doctor_id: int
    doctor_name: str
    available_slots: List[datetime]

    class Config:
        orm_mode = True
