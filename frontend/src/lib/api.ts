const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PoemStyle = "auto" | "modern" | "haiku" | "romantic";

export interface PoemResult {
  title: string;
  body: string;
}

export async function generatePoem(file: File, style: PoemStyle): Promise<PoemResult> {
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
