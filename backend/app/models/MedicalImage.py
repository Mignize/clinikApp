from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class MedicalImage(SQLModel, table=True):  # type: ignore[misc, call-arg]
    __tablename__ = "medical_image"
    id: int = Field(default=None, primary_key=True)
    record_id: int = Field(foreign_key="medical_record.id")
    image_type: str = Field(max_length=50)
    image_url: str = Field(max_length=255)
    upload_at: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str] = Field(default=None, max_length=255)
