from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.deps.auth import SessionDep
from app.models.clinic import Clinic
from app.models.user import User, UserRole
from app.schemas.doctor import AdminRegisterRequest
from app.schemas.patient import PatientRegisterRequest
from app.schemas.user import Token, UserLogin
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register-admin", response_model=Token)
def register_admin(data: AdminRegisterRequest, session: SessionDep):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        email=data.email,
        password=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.ADMIN,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    new_clinic = Clinic(name=data.clinic_name, admin_id=new_user.id)
    session.add(new_clinic)
    session.commit()
    session.refresh(new_clinic)
    token = create_access_token(data={"user_id": new_user.id, "role": new_user.role})
    return Token(access_token=token)


@router.post("/register-patient", response_model=Token)
def register_patient(data: PatientRegisterRequest, session: SessionDep):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    clinic = session.get(Clinic, data.clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    new_user = User(
        email=data.email,
        password=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.PATIENT,
        clinic_id=clinic.id,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    token = create_access_token(data={"user_id": new_user.id, "role": new_user.role})
    return Token(access_token=token)


@router.post("/login-admin", response_model=Token)
def login_admin(user_data: UserLogin, session: SessionDep):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if user.role not in [UserRole.ADMIN, UserRole.DOCTOR]:
        raise HTTPException(
            status_code=403,
            detail="Solo administradores y doctores pueden iniciar sesión aquí",
        )
    token = create_access_token(data={"user_id": user.id, "role": user.role})
    return Token(access_token=token)


@router.post("/login-patient", response_model=Token)
def login_patient(user_data: UserLogin, session: SessionDep):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=403, detail="Solo pacientes pueden iniciar sesión aquí"
        )
    token = create_access_token(data={"user_id": user.id, "role": user.role})
    return Token(access_token=token)
