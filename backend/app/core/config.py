from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    KANANA_API_KEY: str
    KANANA_BASE_URL: str = "https://kanana-o.a2s-endpoint.kr-central-2.kakaocloud.com/v1"
    KANANA_MODEL: str = "kanana-o"

    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_CONTENT_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]

    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
