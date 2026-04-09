"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { generatePoem, generateCard, DUMMY_MODE, PoemStyle, PoemResult } from "@/lib/api";

const STYLES: { value: PoemStyle; label: string; desc: string }[] = [
  { value: "auto", label: "✨ AI 자동", desc: "사진 분위기에 맞게" },
  { value: "modern", label: "🖋️ 현대시", desc: "함축적, 여백있는" },
  { value: "haiku", label: "🍃 하이쿠", desc: "3행, 짧고 깊은" },
  { value: "romantic", label: "🌸 낭만시", desc: "서정적, 감성 충만" },
];

type Step = "upload" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [style, setStyle] = useState<PoemStyle>("auto");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [poem, setPoem] = useState<PoemResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (!accepted[0]) return;
    setFile(accepted[0]);
    setPreview(URL.createObjectURL(accepted[0]));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    if (!file) return;
    setStep("loading");
    setError(null);
    try {
      const result = await generatePoem(file, style);
      setPoem(result);
      setStep("result");
    } catch (e: any) {
      setError(e.message);
      setStep("upload");
    }
  };

  const handleDownloadCard = async () => {
    if (!poem || !preview) return;
    setCardLoading(true);
    try {
      const blob = await generateCard(preview, poem);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${poem.title}_picpoem.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCardLoading(false);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setPreview(null);
    setFile(null);
    setPoem(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0f0f14] text-white flex flex-col items-center px-4 py-16">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Pic<span className="text-purple-400">Poem</span>
        </h1>
        <p className="text-gray-400 text-lg">사진 한 장이 시가 되는 순간</p>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-6 w-full max-w-lg bg-red-900/30 border border-red-700 rounded-xl px-5 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* 업로드 단계 */}
      {step === "upload" && (
        <div className="w-full max-w-lg space-y-6">
          {/* 드롭존 */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-purple-400 bg-purple-900/20" : "border-gray-700 hover:border-gray-500 bg-[#141420]"}
              ${preview ? "border-purple-500" : ""}`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="preview" className="mx-auto max-h-56 rounded-xl object-cover" />
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">📸</div>
                <p className="text-gray-400">사진을 끌어다 놓거나 클릭해서 선택하세요</p>
                <p className="text-gray-600 text-sm">JPG, PNG, WebP · 최대 10MB</p>
              </div>
            )}
          </div>

          {/* 스타일 선택 */}
          {preview && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">시 스타일 선택</p>
              <div className="grid grid-cols-2 gap-3">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`rounded-xl px-4 py-3 text-left transition-colors border
                      ${style === s.value
                        ? "border-purple-500 bg-purple-900/30 text-white"
                        : "border-gray-700 bg-[#141420] text-gray-400 hover:border-gray-500"
                      }`}
                  >
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 생성 버튼 */}
          {preview && (
            <button
              onClick={handleGenerate}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-lg transition-colors"
            >
              시 생성하기 ✨
            </button>
          )}
        </div>
      )}

      {/* 로딩 단계 */}
      {step === "loading" && (
        <div className="text-center space-y-6 mt-8">
          <div className="text-6xl animate-pulse">🖋️</div>
          <p className="text-gray-400 text-lg">사진을 감상하며 시를 쓰고 있어요...</p>
          <p className="text-gray-600 text-sm">보통 5~10초 정도 걸려요</p>
        </div>
      )}

      {/* 결과 단계 */}
      {step === "result" && poem && (
        <div className="w-full max-w-lg space-y-6">
          {/* 사진 + 시 */}
          <div className="relative rounded-2xl overflow-hidden">
            {preview && (
              <img src={preview} alt="uploaded" className="w-full max-h-72 object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2
                className="text-xl font-bold text-white mb-2"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
              >
                {poem.title}
              </h2>
              <div className="w-12 h-0.5 bg-white/60 mb-3" />
              <p
                className="text-gray-100 text-sm whitespace-pre-line leading-relaxed"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
              >
                {poem.body}
              </p>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadCard}
              disabled={cardLoading}
              className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
            >
              {cardLoading ? "생성 중..." : "📥 카드 저장"}
            </button>
            <button
              onClick={handleGenerate}
              className="py-3 rounded-xl border border-gray-600 hover:border-gray-400 text-gray-300 font-medium transition-colors"
            >
              🔄 다시 생성
            </button>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            다른 사진으로 시작하기
          </button>
        </div>
      )}
    </main>
  );
}
