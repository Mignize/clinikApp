from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select

from app.deps.auth import SessionDep, require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserCreateAdminOrDoctor, UserRead, UserUpdate
from app.types.annotated import CurrentUser
from app.utils.security import hash_password

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me", response_model=UserRead)
def get_profile(current_user: CurrentUser):
    return current_user


@router.get("/", response_model=list[UserRead], dependencies=[Depends(require_admin)])
def list_users(session: SessionDep):
    users = session.exec(select(User)).all()
    return users


@router.get(
    "/role/{role}", response_model=list[UserRead], dependencies=[Depends(require_admin)]
)
def list_users_by_role(role: UserRole, session: SessionDep):
    users = session.exec(select(User).where(User.role == role)).all()
    return users


@router.post(
    "/create-admin-or-doctor",
    response_model=UserRead,
    dependencies=[Depends(require_admin)],
)
def create_admin_or_doctor(data: UserCreateAdminOrDoctor, session: SessionDep):
    user = session.exec(select(User).where(User.email == data.email)).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    if data.role not in [UserRole.ADMIN, UserRole.DOCTOR]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    new_user = User(
        email=data.email,
        password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        is_active=True,
        is_verified=False,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user


@router.patch(
    "/{user_id}", response_model=UserRead, dependencies=[Depends(require_admin)]
)
def update_user(user_id: int, data: UserUpdate, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/admin-only", dependencies=[Depends(require_admin)])
def admin_route():
    return {"message": "Solo admins pueden ver esto"}
