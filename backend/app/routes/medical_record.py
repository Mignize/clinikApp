import os
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import select

from app.deps.auth import SessionDep, require_doctor
from app.models.medical_image import MedicalImage
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import (
    MedicalImageRead,
    MedicalRecordCreate,
    MedicalRecordRead,
)

router = APIRouter(prefix="/medical-records", tags=["medical-records"])


file_param = File(...)
description_param = Form(None)
doctor_dep = Depends(require_doctor)


@router.post("/", response_model=MedicalRecordRead, dependencies=[doctor_dep])
def create_medical_record(
    record: MedicalRecordCreate,
    session: SessionDep,
    doctor=doctor_dep,
):
    db_record = MedicalRecord(
        patient_id=record.patient_id,
        doctor_id=doctor.id,
        notes=record.notes,
        diagnosis=record.diagnosis,
        symptoms=record.symptoms,
        treatment=record.treatment,
    )
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record


@router.post(
    "/{record_id}/images", response_model=MedicalImageRead, dependencies=[doctor_dep]
)
def upload_medical_image(
    session: SessionDep,
    record_id: int,
    file: UploadFile = file_param,
    description: Optional[str] = description_param,
):
    upload_dir = "uploads/medical_images"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    image = MedicalImage(
        record_id=record_id,
        image_type=file.content_type,
        image_url=file_path,
        description=description,
    )
    session.add(image)
    session.commit()
    session.refresh(image)
    return image


@router.get("/{record_id}", response_model=MedicalRecordRead, dependencies=[doctor_dep])
def get_medical_record(record_id: int, session: SessionDep):
    record = session.get(MedicalRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record


@router.get("/by-appointment/{appointment_id}", response_model=MedicalRecordRead)
def get_medical_record_by_appointment(appointment_id: int, session: SessionDep):
    record = session.exec(
        select(MedicalRecord).where(MedicalRecord.appointment_id == appointment_id)
    ).first()
    if not record:
        raise HTTPException(
            status_code=404, detail="Medical record not found for this appointment"
        )
    return record
