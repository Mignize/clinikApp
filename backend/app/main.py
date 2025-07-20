from fastapi import FastAPI

from app.database import init_db

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    init_db()
    print("Startup event: Database initialized.")


@app.get("/")
async def root():
    return {"message": "Hello World"}
