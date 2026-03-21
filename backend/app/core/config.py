from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CareCircle Backend"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    # Local Postgres for development. Replace this with your hosted DB URL later.
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/checkin"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ca-central-1"
    s3_bucket_name: str = ""
    s3_recordings_prefix: str = "sessions"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-pro"
    heygen_api_key: str = ""
    heygen_base_url: str = "https://api.heygen.com"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_phone_number: str = ""
    firebase_project_id: str = ""
    firebase_private_key: str = ""
    firebase_client_email: str = ""
    frontend_base_url: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
