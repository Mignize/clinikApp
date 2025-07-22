from typing import List

from fastapi import APIRouter, HTTPException, Query, Response
from sqlmodel import select

from app.deps.auth import SessionDep
from app.models.appointment import Appointment
from app.models.medical_record import MedicalRecord
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
)
from app.schemas.medical_record import MedicalRecordCreate
from app.types.annotated import CurrentUser

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.post("/", response_model=AppointmentRead, status_code=201)
def create_appointment(appointment: AppointmentCreate, session: SessionDep):
    db_appointment = Appointment(**appointment.dict())
    session.add(db_appointment)
    session.commit()
    session.refresh(db_appointment)
    return db_appointment


@router.get("/", response_model=List[AppointmentRead])
def list_appointments(
    session: SessionDep,
    user: CurrentUser,
    response: Response,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    base_query = select(Appointment)
    if user.role == "doctor":
        base_query = base_query.where(Appointment.doctor_id == user.id)
    elif user.role == "patient":
        base_query = base_query.where(Appointment.patient_id == user.id)
    appointments = session.exec(base_query.offset(offset).limit(limit)).all()
    response.headers["X-Total-Count"] = str(len(appointments))
    user_ids = set()
    for appt in appointments:
        user_ids.add(appt.doctor_id)
        user_ids.add(appt.patient_id)
    users = session.exec(select(User).where(User.id.in_(user_ids))).all()
    user_map = {u.id: u for u in users}
    result = []
    for appt in appointments:
        doctor = user_map.get(appt.doctor_id)
        patient = user_map.get(appt.patient_id)
        result.append(
            {
                **appt.dict(),
                "doctor_name": doctor.full_name or doctor.email if doctor else None,
                "patient_name": patient.full_name or patient.email if patient else None,
            }
        )
    return result


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, session: SessionDep, user: CurrentUser):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if user.role == "doctor" and appointment.doctor_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if user.role == "patient" and appointment.patient_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentRead)
def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    session: SessionDep,
    user: CurrentUser,
):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if user.role == "doctor" and appointment.doctor_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if user.role == "patient" and appointment.patient_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    for field, value in appointment_update.dict(exclude_unset=True).items():
        setattr(appointment, field, value)
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, session: SessionDep, user: CurrentUser):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if user.role == "doctor" and appointment.doctor_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if user.role == "patient" and appointment.patient_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    session.delete(appointment)
    session.commit()
    return None


@router.post("/{appointment_id}/complete", response_model=AppointmentRead)
def complete_appointment(
    appointment_id: int,
    data: MedicalRecordCreate,
    session: SessionDep = None,
    user: CurrentUser = None,
):
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if user.role != "doctor" or appointment.doctor_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    appointment.status = "completed"
    session.add(appointment)
    session.commit()

    record = MedicalRecord(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_id=appointment.id,
        notes=data.notes,
        diagnosis=data.diagnosis,
        symptoms=data.symptoms,
        treatment=data.treatment,
    )
    session.add(record)
    session.commit()
    session.refresh(appointment)
    return appointment
