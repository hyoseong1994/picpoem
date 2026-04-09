import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

if (!process.env.KANANA_API_KEY) {
  throw new Error("KANANA_API_KEY 환경변수가 설정되지 않았습니다.");
}

const client = new OpenAI({
  baseURL: process.env.KANANA_BASE_URL ?? "https://kanana-o.a2s-endpoint.kr-central-2.kakaocloud.com/v1",
  apiKey: process.env.KANANA_API_KEY,
});

const STYLE_PROMPTS: Record<string, string> = {
  modern: "4~8행의 현대시로 써주세요. 함축적이고 여백이 있는 언어를 사용해주세요.",
  haiku: "하이쿠 형식(5-7-5 음절)으로 3행시를 써주세요.",
  romantic: "낭만적이고 서정적인 8~12행의 시로 써주세요. 감정이 풍부하게 흘러넘치는 표현을 사용해주세요.",
  auto: "사진의 분위기에 가장 잘 맞는 형식으로 자유롭게 4~10행의 시를 써주세요.",
};

const BASE_PROMPT = `이 사진을 감상하고 아름다운 한국어 시를 써주세요.

조건:
- 사진 속 풍경, 계절, 색감, 빛, 감정을 깊이 담아주세요
- {style_instruction}
- 제목을 첫 줄에 쓰고, 빈 줄 하나를 넣은 뒤 시를 써주세요
- 제목 앞뒤에 특수문자나 꺾쇠 없이 제목만 써주세요
- 설명이나 부연 없이 시만 출력해주세요`;

const ALLOWED_STYLES = new Set(["auto", "modern", "haiku", "romantic"]);
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const style = (form.get("style") as string) ?? "auto";

  if (!file)
    return NextResponse.json({ detail: "파일이 없습니다." }, { status: 400 });
  if (!ALLOWED_CONTENT_TYPES.has(file.type))
    return NextResponse.json({ detail: "지원하지 않는 이미지 형식입니다. (jpg, png, webp)" }, { status: 400 });
  if (!ALLOWED_STYLES.has(style))
    return NextResponse.json({ detail: "지원하지 않는 스타일입니다." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ detail: "이미지 크기는 10MB 이하여야 합니다." }, { status: 413 });

  const imageBytes = await file.arrayBuffer();
  const b64 = Buffer.from(imageBytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${b64}`;
  const prompt = BASE_PROMPT.replace("{style_instruction}", STYLE_PROMPTS[style] ?? STYLE_PROMPTS.auto);

  try {
    const response = await client.chat.completions.create({
      model: process.env.KANANA_MODEL ?? "kanana-o",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const raw = response.choices[0].message.content?.trim() ?? "";
    const lines = raw.split("\n");
    const title = lines[0]?.trim() ?? "무제";
    const bodyLines = lines.length > 2 ? lines.slice(2) : lines.slice(1);
    const body = bodyLines.join("\n").trim();

    return NextResponse.json({ title, body });
  } catch (err) {
    console.error("[poem/generate] AI API 호출 실패:", err);
    return NextResponse.json(
      { detail: "AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
