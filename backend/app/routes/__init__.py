from .appointment import router as appointment_router
from .auth import router as auth_router
from .availability import router as availability_router
from .medical_record import router as medical_record_router
from .patient import router as patient_router
from .user import router as user_router

__all__ = [
    "auth_router",
    "user_router",
    "appointment_router",
    "availability_router",
    "medical_record_router",
    "patient_router",
]
