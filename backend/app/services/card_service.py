import io
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import textwrap


def create_poem_card(image_bytes: bytes, title: str, body: str) -> bytes:
    """원본 사진 위에 시를 얹은 카드 이미지를 생성합니다."""

    # 원본 이미지 로드
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

    # 카드 크기 고정 (인스타 정사각형 비율)
    CARD_SIZE = (1080, 1080)
    img = img.resize(CARD_SIZE, Image.LANCZOS)

    # 하단 그라데이션 오버레이 (텍스트 가독성)
    overlay = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)

    for i in range(CARD_SIZE[1] // 2, CARD_SIZE[1]):
        alpha = int(200 * (i - CARD_SIZE[1] // 2) / (CARD_SIZE[1] // 2))
        draw_overlay.line([(0, i), (CARD_SIZE[0], i)], fill=(0, 0, 0, alpha))

    img = Image.alpha_composite(img, overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # 폰트 (시스템 기본 폰트 사용, 실제 서비스에선 웹폰트 추가 권장)
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
    except Exception:
        title_font = ImageFont.load_default()
        body_font = ImageFont.load_default()

    padding = 60
    text_y = CARD_SIZE[1] - 400

    # 제목
    draw.text((padding, text_y), title, font=title_font, fill=(255, 255, 255))
    text_y += 70

    # 구분선
    draw.line([(padding, text_y), (padding + 80, text_y)], fill=(255, 255, 255, 180), width=2)
    text_y += 24

    # 시 본문 (줄바꿈 처리)
    wrapped_lines = []
    for line in body.split("\n"):
        if line.strip():
            wrapped_lines.extend(textwrap.wrap(line, width=22) or [line])
        else:
            wrapped_lines.append("")

    for line in wrapped_lines[:8]:  # 최대 8줄
        draw.text((padding, text_y), line, font=body_font, fill=(230, 230, 230))
        text_y += 44

    # 워터마크
    try:
        wm_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except Exception:
        wm_font = ImageFont.load_default()
    draw.text(
        (CARD_SIZE[0] - 160, CARD_SIZE[1] - 36),
        "PicPoem",
        font=wm_font,
        fill=(255, 255, 255, 120),
    )

    # PNG로 반환
    output = io.BytesIO()
    img.save(output, format="PNG", quality=95)
    return output.getvalue()
