from fastapi import APIRouter, Depends
from sqlmodel import select

from app.deps.auth import SessionDep, require_admin
from app.models.user import User, UserRole
from app.schemas.user import UserRead
from app.types.annotated import CurrentUser

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


@router.get("/admin-only", dependencies=[Depends(require_admin)])
def admin_route():
    return {"message": "Solo admins pueden ver esto"}
