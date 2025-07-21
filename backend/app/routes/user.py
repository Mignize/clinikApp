from fastapi import APIRouter, Depends

from app.deps.auth import require_admin
from app.schemas.user import UserRead
from app.types.annotated import CurrentUser

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me", response_model=UserRead)
def get_profile(current_user: CurrentUser):
    return current_user


@router.get("/admin-only", dependencies=[Depends(require_admin)])
def admin_route():
    return {"message": "Solo admins pueden ver esto"}
