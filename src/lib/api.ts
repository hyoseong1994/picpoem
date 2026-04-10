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
    const cardHeight = 1080;

    const img = new Image();
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext("2d")!;

      // object-cover: 이미지를 캔버스에 꽉 채우도록 크롭
      const imgAspect = img.width / img.height;
      const canvasAspect = cardWidth / cardHeight;
      let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
      if (imgAspect > canvasAspect) {
        srcW = img.height * canvasAspect;
        srcX = (img.width - srcW) / 2;
      } else {
        srcH = img.width / canvasAspect;
        srcY = (img.height - srcH) / 2;
      }
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, cardWidth, cardHeight);

      // 하단 그라데이션 오버레이 (미리보기와 동일: transparent → black/50 → black/90)
      const gradH = cardHeight * 0.65;
      const gradient = ctx.createLinearGradient(0, cardHeight - gradH, 0, cardHeight);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.38, "rgba(0,0,0,0.5)");
      gradient.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, cardHeight - gradH, cardWidth, gradH);

      // 텍스트 레이아웃 (아래에서 위로 계산)
      const padding = 72;
      const bottomPadding = 88;
      const titleSize = 52;
      const bodySize = 36;
      const bodyLineHeight = 52;
      const accentBarH = 3;

      const bodyLines = poem.body.split("\n");

      // 아래에서 위로: 마지막 바디 라인 baseline → 첫 바디 라인 → 악센트바 → 타이틀
      const lastBodyY = cardHeight - bottomPadding;
      const firstBodyY = lastBodyY - (bodyLines.length - 1) * bodyLineHeight;
      // 바디 텍스트 상단(ascent 포함) 위에 여백을 두고 악센트바 배치
      const accentBarY = firstBodyY - bodySize - 16 - accentBarH;
      const titleY = accentBarY - 20; // baseline

      // 타이틀
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "white";
      ctx.font = `bold ${titleSize}px sans-serif`;
      ctx.fillText(poem.title, padding, titleY);

      // 악센트 바 (미리보기와 동일: white/60)
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(padding, accentBarY, 96, accentBarH);

      // 바디 텍스트
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#f3f4f6";
      ctx.font = `${bodySize}px sans-serif`;
      bodyLines.forEach((line, i) => {
        ctx.fillText(line, padding, firstBodyY + i * bodyLineHeight);
      });

      ctx.shadowBlur = 0;
      canvas.toBlob((blob) => resolve(blob!), "image/png");
    };
    img.src = previewUrl;
  });
}
