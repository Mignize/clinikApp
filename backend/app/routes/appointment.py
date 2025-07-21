from typing import List

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.deps.auth import SessionDep
from app.models.appointment import Appointment
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentUpdate,
)
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
def list_appointments(session: SessionDep, user: CurrentUser):
    if user.role == "doctor":
        appointments = session.exec(
            select(Appointment).where(Appointment.doctor_id == user.id)
        ).all()
    elif user.role == "patient":
        appointments = session.exec(
            select(Appointment).where(Appointment.patient_id == user.id)
        ).all()
    else:
        appointments = session.exec(select(Appointment)).all()
    return appointments


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
