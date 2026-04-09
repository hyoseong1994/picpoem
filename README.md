# 📸 PicPoem

> 풍경 사진을 올리면 AI가 한국어 시를 써드립니다

---

## 프로젝트 구조

```
picpoem/
└── src/
    ├── app/
    │   ├── api/poem/generate/  # 시 생성 API Route
    │   └── page.tsx            # 메인 페이지
    └── lib/
        └── api.ts              # API 클라이언트 + 카드 생성
```

---

## 로컬 실행

```bash
cp .env.local.example .env.local
# .env.local에 KANANA_API_KEY 입력

npm install
npm run dev
# → http://localhost:3000
```

---

## 배포 (Vercel)

1. [vercel.com](https://vercel.com) → Import Git Repository
2. 환경변수 설정:
   - `KANANA_API_KEY` — Kakao Cloud에서 발급받은 키
   - `KANANA_BASE_URL` — `https://kanana-o.a2s-endpoint.kr-central-2.kakaocloud.com/v1`
   - `KANANA_MODEL` — `kanana-o`

---

## 시 스타일 옵션

| 값 | 설명 |
|----|------|
| `auto` | AI가 분위기에 맞게 자동 선택 |
| `modern` | 현대시 (함축적, 여백) |
| `haiku` | 하이쿠 (3행) |
| `romantic` | 낭만시 (서정적) |
