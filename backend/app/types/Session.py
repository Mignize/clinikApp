from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.database import get_session
from app.schemas.auth_schemes import oauth2_scheme

TokenDep = Annotated[str, Depends(oauth2_scheme)]
SessionDep = Annotated[Session, Depends(get_session)]
