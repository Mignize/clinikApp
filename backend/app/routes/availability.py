from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import select

from app.deps.auth import SessionDep, require_patient
from app.models.user import User, UserRole
from app.schemas.doctor import DoctorAvailability

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get(
    "/",
    response_model=List[DoctorAvailability],
    dependencies=[Depends(require_patient)],
)
def get_doctor_availability(session: SessionDep):
    doctors = session.exec(select(User).where(User.role == UserRole.DOCTOR)).all()
    result = []
    for doctor in doctors:
        now = datetime.now()
        slots = [now + timedelta(days=1, hours=h) for h in (9, 11, 15)]
        result.append(
            DoctorAvailability(
                doctor_id=doctor.id,
                doctor_name=doctor.full_name or doctor.email,
                available_slots=slots,
            )
        )
    return result
