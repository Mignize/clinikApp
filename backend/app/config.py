import os

from pydantic_settings import BaseSettings, SettingsConfigDict

print("DEBUG ENV ----")
print("DATABASE_URL:", os.environ.get("DATABASE_URL"))
print("SECRET_KEY:", os.environ.get("SECRET_KEY"))
print("FRONTEND_URL:", os.environ.get("FRONTEND_URL"))


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    FRONTEND_URL: str = "http://localhost:4200"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
print("From settings object:")
print(settings.DATABASE_URL)
print(settings.SECRET_KEY)
print(settings.FRONTEND_URL)
