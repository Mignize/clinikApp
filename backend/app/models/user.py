from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from .clinic import Clinic


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"


class User(SQLModel, table=True):  # type: ignore[misc, call-arg]
    __tablename__ = "user"
    id: int = Field(default=None, primary_key=True)
    email: str = Field(max_length=100, unique=True)
    password: str
    full_name: Optional[str] = Field(default=None, max_length=100)
    role: UserRole = Field(default=UserRole.PATIENT)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    clinic_id: Optional[int] = Field(default=None, foreign_key="clinic.id")
    clinic: Optional["Clinic"] = Relationship(
        back_populates="patients",
        sa_relationship_kwargs={"foreign_keys": "[User.clinic_id]"},
    )
    clinic_admin: Optional["Clinic"] = Relationship(
        back_populates="admin",
        sa_relationship_kwargs={"foreign_keys": "[Clinic.admin_id]"},
    )
