from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    app_name: str = "MatchMind One API"
    env: str = Field(default="development", alias="MATCHMIND_ENV")
    backend_host: str = Field(default="127.0.0.1", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    database_url: str = Field(default="sqlite:///./matchmind_one.db", alias="DATABASE_URL")
    ibm_watsonx_api_key: str = Field(default="", alias="IBM_WATSONX_API_KEY")
    ibm_watsonx_project_id: str = Field(default="", alias="IBM_WATSONX_PROJECT_ID")
    ibm_watsonx_url: str = Field(default="https://us-south.ml.cloud.ibm.com", alias="IBM_WATSONX_URL")
    ibm_watsonx_model_id: str = Field(default="granite-3-2b-instruct", alias="IBM_WATSONX_MODEL_ID")
    ibm_watsonx_use_mock: bool = Field(default=True, alias="IBM_WATSONX_USE_MOCK")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
