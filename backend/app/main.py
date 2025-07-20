from fastapi import FastAPI

from app.database import init_db
from app.routes import auth_router, user_router

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
