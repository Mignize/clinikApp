from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.deps.auth import SessionDep, require_doctor, require_patient
from app.models.medical_image import MedicalImage
from app.models.medical_record import MedicalRecord
from app.models.user import User, UserRole
from app.schemas.medical_record import MedicalRecordRead
from app.schemas.patient import PatientProfile, PatientProfileOwn
from app.types.annotated import CurrentUser

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get(
    "/me",
    response_model=PatientProfileOwn,
    dependencies=[Depends(require_patient)],
)
def get_own_profile(current_user: CurrentUser, session: SessionDep):
    patient = session.get(User, current_user.id)

    if not patient or patient.role != UserRole.PATIENT:
        raise HTTPException(status_code=404, detail="Patient not found")

    records = session.exec(
        select(MedicalRecord).where(MedicalRecord.patient_id == patient.id)
    ).all()

    doctor_map = {
        d.id: d.full_name or d.email
        for d in session.exec(
            select(User).where(User.id.in_({r.doctor_id for r in records}))
        )
    }

    records_with_doctor = [
        MedicalRecordRead(
            **r.dict(), doctor_name=doctor_map.get(r.doctor_id, f"ID {r.doctor_id}")
        )
        for r in records
    ]

    record_ids = [r.id for r in records]
    images = session.exec(
        select(MedicalImage).where(MedicalImage.record_id.in_(record_ids))
    ).all()

    return PatientProfileOwn(
        id=patient.id,
        full_name=patient.full_name,
        email=patient.email,
        created_at=patient.created_at,
        medical_records=records_with_doctor,
        medical_images=images,
    )


@router.get(
    "/", response_model=List[PatientProfile], dependencies=[Depends(require_doctor)]
)
def list_patients(session: SessionDep):
    patients = session.exec(select(User).where(User.role == UserRole.PATIENT)).all()
    result = []
    for patient in patients:
        records = session.exec(
            select(MedicalRecord).where(MedicalRecord.patient_id == patient.id)
        ).all()
        images = session.exec(
            select(MedicalImage)
            .join(MedicalRecord, MedicalImage.record_id == MedicalRecord.id)
            .where(MedicalRecord.patient_id == patient.id)
        ).all()
        result.append(
            PatientProfile(
                id=patient.id,
                full_name=patient.full_name,
                email=patient.email,
                created_at=patient.created_at,
                medical_records=[r.id for r in records],
                medical_images=[i.id for i in images],
            )
        )
    return result


@router.get(
    "/{patient_id}",
    response_model=PatientProfile,
    dependencies=[Depends(require_doctor)],
)
def get_patient_profile(patient_id: int, session: SessionDep):
    patient = session.get(User, patient_id)
    if not patient or patient.role != UserRole.PATIENT:
        raise HTTPException(status_code=404, detail="Patient not found")
    records = session.exec(
        select(MedicalRecord).where(MedicalRecord.patient_id == patient.id)
    ).all()
    images = session.exec(
        select(MedicalImage)
        .join(MedicalRecord, MedicalImage.record_id == MedicalRecord.id)
        .where(MedicalRecord.patient_id == patient.id)
    ).all()
    return PatientProfile(
        id=patient.id,
        full_name=patient.full_name,
        email=patient.email,
        created_at=patient.created_at,
        medical_records=[r.id for r in records],
        medical_images=[i.id for i in images],
    )
