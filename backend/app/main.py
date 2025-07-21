from fastapi import FastAPI

from app.database import init_db
from app.routes import (
    appointment_router,
    auth_router,
    availability_router,
    medical_record_router,
    patient_router,
    user_router,
)

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    init_db()
    print("Startup event: Database initialized.")


@app.get("/")
async def root():
    return {"message": "Hello World"}


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(appointment_router)
app.include_router(availability_router)
app.include_router(medical_record_router)
app.include_router(patient_router)
