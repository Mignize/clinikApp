from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"

class User(SQLModel, table=True):
    __tablename__ = "user"
    id: int = Field(default=None, primary_key=True)
    email: str = Field(max_length=100, unique=True)
    password: str
    full_name: Optional[str] = Field(default=None, max_length=100)
    role: UserRole = Field(default=UserRole.PATIENT)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)