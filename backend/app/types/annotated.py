from typing import Annotated

from fastapi import Depends

from app.deps.auth import get_current_user
from app.models.user import User

CurrentUser = Annotated[User, Depends(get_current_user)]
