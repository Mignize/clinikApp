from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class Clinic(SQLModel, table=True):  # type: ignore[misc, call-arg]
    __tablename__ = "clinic"
    id: int = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True)
    address: Optional[str] = Field(default=None, max_length=255)
    admin_id: int = Field(foreign_key="user.id", unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    admin: Optional["User"] = Relationship(
        back_populates="clinic_admin",
        sa_relationship_kwargs={"foreign_keys": "[Clinic.admin_id]"},
    )
    patients: List["User"] = Relationship(
        back_populates="clinic",
        sa_relationship_kwargs={"foreign_keys": "[User.clinic_id]"},
    )
