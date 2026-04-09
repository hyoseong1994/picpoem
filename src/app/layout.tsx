import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PicPoem — 사진이 시가 되는 순간",
  description: "풍경 사진을 업로드하면 AI가 한국어 시를 써드립니다",
  openGraph: {
    title: "PicPoem",
    description: "사진 한 장이 시가 되는 순간",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
