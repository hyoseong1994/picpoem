import base64
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(
    base_url=settings.KANANA_BASE_URL,
    api_key=settings.KANANA_API_KEY,
)

STYLE_PROMPTS = {
    "modern": "4~8행의 현대시로 써주세요. 함축적이고 여백이 있는 언어를 사용해주세요.",
    "haiku": "하이쿠 형식(5-7-5 음절)으로 3행시를 써주세요.",
    "romantic": "낭만적이고 서정적인 8~12행의 시로 써주세요. 감정이 풍부하게 흘러넘치는 표현을 사용해주세요.",
    "auto": "사진의 분위기에 가장 잘 맞는 형식으로 자유롭게 4~10행의 시를 써주세요.",
}

BASE_PROMPT = """
이 사진을 감상하고 아름다운 한국어 시를 써주세요.

조건:
- 사진 속 풍경, 계절, 색감, 빛, 감정을 깊이 담아주세요
- {style_instruction}
- 제목을 첫 줄에 쓰고, 빈 줄 하나를 넣은 뒤 시를 써주세요
- 제목 앞뒤에 특수문자나 꺾쇠 없이 제목만 써주세요
- 설명이나 부연 없이 시만 출력해주세요
"""


async def generate_poem(image_bytes: bytes, content_type: str, style: str = "auto") -> dict:
    """이미지를 받아 한국어 시를 생성합니다."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{b64}"

    style_instruction = STYLE_PROMPTS.get(style, STYLE_PROMPTS["auto"])
    prompt = BASE_PROMPT.format(style_instruction=style_instruction)

    response = await client.chat.completions.create(
        model=settings.KANANA_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    )

    raw = response.choices[0].message.content.strip()

    # 제목과 시 본문 분리
    lines = raw.split("\n")
    title = lines[0].strip() if lines else "무제"
    body_lines = lines[2:] if len(lines) > 2 else lines[1:]
    body = "\n".join(body_lines).strip()

    return {"title": title, "body": body, "full": raw}
