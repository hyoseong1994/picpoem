from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import poem
from app.core.config import settings

app = FastAPI(
    title="PicPoem API",
    description="풍경 사진을 한국어 시로 변환하는 API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(poem.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "picpoem-backend"}
