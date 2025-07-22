from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ClinicRead(BaseModel):
    id: int
    name: str
    address: Optional[str]
    admin_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ClinicCreate(BaseModel):
    name: str
    address: Optional[str]
    admin_id: int
