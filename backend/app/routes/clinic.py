from fastapi import APIRouter
from sqlmodel import select

from app.deps.auth import SessionDep
from app.models import Clinic
from app.schemas.clinic import ClinicRead

router = APIRouter(prefix="/clinics", tags=["clinics"])


@router.get("/", response_model=list[ClinicRead])
def list_clinics(session: SessionDep):
    clinics = session.exec(select(Clinic)).all()
    return clinics
