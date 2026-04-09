export type PoemStyle = "auto" | "modern" | "haiku" | "romantic";

export interface PoemResult {
  title: string;
  body: string;
}

export const DUMMY_MODE = process.env.NEXT_PUBLIC_DUMMY_MODE === "true";

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

  const res = await fetch("/api/poem/generate", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "시 생성에 실패했어요. 다시 시도해주세요.");
  }

  return res.json();
}

export async function generateCard(previewUrl: string, poem: PoemResult): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const cardWidth = 1080;
    const textAreaHeight = 320;
    const bodyStartOffset = 156;
    const lineHeight = 54;
    const bottomPadding = 16;
    const maxLines = Math.floor((textAreaHeight - bodyStartOffset - bottomPadding) / lineHeight);

    const img = new Image();
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.onload = () => {
      const imgHeight = Math.round((img.height / img.width) * cardWidth);

      const canvas = document.createElement("canvas");
      canvas.width = cardWidth;
      canvas.height = imgHeight + textAreaHeight;
      const ctx = canvas.getContext("2d")!;

      ctx.drawImage(img, 0, 0, cardWidth, imgHeight);

      ctx.fillStyle = "#1a1a24";
      ctx.fillRect(0, imgHeight, cardWidth, textAreaHeight);

      ctx.fillStyle = "white";
      ctx.font = "bold 52px sans-serif";
      ctx.fillText(poem.title, 64, imgHeight + 80);

      ctx.fillStyle = "rgba(167,139,250,0.6)";
      ctx.fillRect(64, imgHeight + 104, 80, 2);

      ctx.fillStyle = "#e5e7eb";
      ctx.font = "36px sans-serif";
      const bodyLines = poem.body.split("\n");
      const visibleLines = bodyLines.slice(0, maxLines);
      if (bodyLines.length > maxLines) {
        visibleLines[maxLines - 1] = visibleLines[maxLines - 1].trimEnd() + "…";
      }
      visibleLines.forEach((line, i) => {
        ctx.fillText(line, 64, imgHeight + bodyStartOffset + i * lineHeight);
      });

      canvas.toBlob((blob) => resolve(blob!), "image/png");
    };
    img.src = previewUrl;
  });
}
