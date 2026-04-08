import io
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import Response
from app.services.poem_service import generate_poem
from app.services.card_service import create_poem_card
from app.core.config import settings

router = APIRouter(prefix="/poem", tags=["poem"])

MAX_BYTES = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
ALLOWED_STYLES = {"auto", "modern", "haiku", "romantic"}


def _validate_image(file: UploadFile) -> None:
    if file.content_type not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="지원하지 않는 이미지 형식입니다. (jpg, png, webp)")


@router.post("/generate")
async def generate(
    file: UploadFile = File(...),
    style: str = Form(default="auto"),
):
    """사진 업로드 → 한국어 시 생성"""
    _validate_image(file)
    if style not in ALLOWED_STYLES:
        raise HTTPException(status_code=400, detail=f"style은 {ALLOWED_STYLES} 중 하나여야 합니다.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"이미지 크기는 {settings.MAX_IMAGE_SIZE_MB}MB 이하여야 합니다.")

    poem = await generate_poem(image_bytes, file.content_type, style)
    return {"title": poem["title"], "body": poem["body"]}


@router.post("/card")
async def generate_card(
    file: UploadFile = File(...),
    style: str = Form(default="auto"),
):
    """사진 업로드 → 시 생성 → 카드 이미지 반환"""
    _validate_image(file)
    if style not in ALLOWED_STYLES:
        raise HTTPException(status_code=400, detail=f"style은 {ALLOWED_STYLES} 중 하나여야 합니다.")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"이미지 크기는 {settings.MAX_IMAGE_SIZE_MB}MB 이하여야 합니다.")

    poem = await generate_poem(image_bytes, file.content_type, style)
    card_bytes = create_poem_card(image_bytes, poem["title"], poem["body"])

    return Response(
        content=card_bytes,
        media_type="image/png",
        headers={
            "X-Poem-Title": poem["title"],
            "Content-Disposition": 'attachment; filename="picpoem_card.png"',
        },
    )
