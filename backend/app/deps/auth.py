from typing import Annotated

from fastapi import Depends, HTTPException

from app.models.user import User, UserRole
from app.types.session import SessionDep, TokenDep
from app.utils.security import decode_token


def get_current_user(
    token: TokenDep,
    session: SessionDep,
) -> User:
    try:
        payload = decode_token(token)
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e


def require_role(required_role: UserRole):
    def role_dependency(
        current_user: Annotated[User, Depends(get_current_user)]
    ) -> User:
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return current_user

    return role_dependency


require_admin = require_role(UserRole.ADMIN)
require_doctor = require_role(UserRole.DOCTOR)
require_patient = require_role(UserRole.PATIENT)
