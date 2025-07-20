from fastapi import APIRouter, Form, HTTPException
from sqlmodel import select

from app.deps.auth import SessionDep
from app.models import User
from app.schemas import Token, UserCreate, UserLogin
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, session: SessionDep):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        password=hash_password(user_data.password),
        full_name=user_data.full_name,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    token = create_access_token(data={"user_id": new_user.id})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, session: SessionDep):
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"user_id": user.id})
    return Token(access_token=token)


@router.post("/login-swagger", response_model=Token)
def login_form(
    session: SessionDep, username: str = Form(...), password: str = Form(...)
):
    user = session.exec(select(User).where(User.email == username)).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(data={"user_id": user.id})
    return Token(access_token=token)
