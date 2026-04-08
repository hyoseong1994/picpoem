# 📸 PicPoem

> 풍경 사진을 올리면 AI가 한국어 시를 써드립니다

---

## 프로젝트 구조

```
picpoem/
├── backend/        # FastAPI (Python) — Railway 배포
│   ├── app/
│   │   ├── api/           # 엔드포인트
│   │   ├── core/          # 설정
│   │   └── services/      # 시 생성, 카드 합성
│   ├── Dockerfile
│   └── railway.toml
└── frontend/       # Next.js — Vercel 배포
    └── src/
        ├── app/           # 페이지
        └── lib/           # API 클라이언트
```

---

## 로컬 실행

### 백엔드

```bash
cd backend
cp .env.example .env
# .env에 KANANA_API_KEY 입력

pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
```

### 프론트엔드

```bash
cd frontend
cp .env.local.example .env.local

npm install
npm run dev
# → http://localhost:3000
```

---

## 배포

### 백엔드 → Railway

1. [railway.app](https://railway.app) 가입 후 New Project → Deploy from GitHub
2. `backend/` 폴더 선택 (Dockerfile 자동 감지)
3. 환경변수 설정: `KANANA_API_KEY`, `CORS_ORIGINS`

### 프론트엔드 → Vercel

1. [vercel.com](https://vercel.com) → Import Git Repository
2. Root Directory: `frontend`
3. 환경변수 설정: `NEXT_PUBLIC_API_URL` = Railway에서 발급된 URL

---

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| POST | `/api/poem/generate` | 시 텍스트 생성 |
| POST | `/api/poem/card` | 시 카드 이미지 생성 |

### 시 스타일 옵션

- `auto` — AI가 분위기에 맞게 자동 선택
- `modern` — 현대시 (함축적, 여백)
- `haiku` — 하이쿠 (3행)
- `romantic` — 낭만시 (서정적)
