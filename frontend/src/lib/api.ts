const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PoemStyle = "auto" | "modern" | "haiku" | "romantic";

export interface PoemResult {
  title: string;
  body: string;
}

export const DUMMY_MODE = true;

const DUMMY_POEMS: Record<PoemStyle, PoemResult> = {
  auto: {
    title: "빛의 잔상",
    body: "노을이 내린 언덕 위에\n긴 그림자 하나 누워 있다\n바람은 말이 없고\n풀잎만 끄덕인다",
  },
  modern: {
    title: "정물",
    body: "창문 너머\n빛이 먼저 도착해 있었다\n나는 늦었다",
  },
  haiku: {
    title: "첫눈",
    body: "소리 없이 내려\n지붕 위에 쌓이는 말\n아무도 읽지 않는",
  },
  romantic: {
    title: "그리운 오후",
    body: "당신이 떠난 자리에\n햇살이 들어와 앉았습니다\n따뜻한 척 오래도록\n그 자리를 지킵니다\n\n바람이 커튼을 들추면\n잠깐 당신인 줄 알았어요",
  },
};

export async function generatePoem(file: File, style: PoemStyle): Promise<PoemResult> {
  if (DUMMY_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return DUMMY_POEMS[style];
  }

  const form = new FormData();
  form.append("file", file);
  form.append("style", style);

  const res = await fetch(`${API_BASE}/api/poem/generate`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "시 생성에 실패했어요. 다시 시도해주세요.");
  }

  return res.json();
}

export async function generateDummyCard(previewUrl: string, poem: PoemResult): Promise<Blob> {
  return new Promise((resolve) => {
    const size = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const img = new Image();
    img.onload = () => {
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

      const grad = ctx.createLinearGradient(0, size * 0.35, 0, size);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.6)");
      grad.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 12;

      ctx.fillStyle = "white";
      ctx.font = "bold 52px sans-serif";
      ctx.fillText(poem.title, 64, size - 320);

      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(64, size - 290, 80, 2);

      ctx.fillStyle = "#e5e7eb";
      ctx.font = "36px sans-serif";
      poem.body.split("\n").forEach((line, i) => {
        ctx.fillText(line, 64, size - 248 + i * 56);
      });

      canvas.toBlob((blob) => resolve(blob!), "image/png");
    };
    img.src = previewUrl;
  });
}

export async function generateCard(file: File, style: PoemStyle): Promise<{ blob: Blob; title: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("style", style);

  const res = await fetch(`${API_BASE}/api/poem/card`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "카드 생성에 실패했어요. 다시 시도해주세요.");
  }

  const blob = await res.blob();
  const title = res.headers.get("X-Poem-Title") ?? "picpoem_card";
  return { blob, title };
}
