# 🍿 OTT-Food Match

> OTT 플랫폼과 음식 조합을 한 번에 추천해주는 웹 서비스

[![라이브 데모](https://img.shields.io/badge/🍿_라이브_데모-FF715B?style=for-the-badge)](https://ott-food-match.vercel.app)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Netflix · Disney+ · TVING · wavve 영화와 식사 상황을 연결해 최적의 조합을 추천합니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📺 OTT 기반 영화 추천 | Netflix · Disney+ · TVING · wavve별 영화 목록, 장르 필터 및 정렬 |
| 🍕 음식 → 영화 추천 | 음식 선택 기준으로 시작해 어울리는 OTT 콘텐츠까지 연결하는 플로우 |
| 🤖 AI 추천 사유 생성 | Gemini API가 영화 분위기 · 음식 조합의 이유를 자연어로 설명 |
| 🔍 영화 제목 검색 | 로드된 영화 목록에서 제목으로 실시간 클라이언트 필터링 |
| 👤 마이페이지 | 저장 조합 수 · 좋아요/싫어요 통계 · 자주 선택한 OTT·음식·장르 분석 |
| ☁️ Firestore 동기화 | Google 로그인 후 저장 조합이 Firebase에 자동 동기화 · 다기기 공유 |
| 🗺️ 주변 음식점 탐색 | Kakao Maps API로 추천 음식 카테고리 기반 근처 음식점 검색 |
| 📱 PWA · 다국어 | 홈 화면 설치 · 오프라인 캐싱 / 한국어 · 영어 · 중국어 · 일본어 지원 |

---

## 🛠 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| Frontend | HTML5 · CSS3 · Vanilla JS (ES Modules) | 프레임워크 없는 모듈 구성 |
| Backend | Vercel Serverless Functions | `/api` 폴더 — TMDB · Gemini 프록시 |
| Auth / DB | Firebase Authentication · Firestore | Google 로그인 · 저장 조합 동기화 |
| 영화 데이터 | TMDB API | OTT별 영화 목록 · 상세 정보 |
| AI 추천 | Gemini API | 음식 추천 · 조합 이유 자연어 생성 |
| 지도 | Kakao Maps API | 주변 음식점 검색 |
| 배포 | Vercel | 자동 배포 (main 브랜치 push) |
| PWA | Service Worker · Web Manifest | 오프라인 캐싱 · 홈 화면 설치 |

---

## 🔀 서비스 플로우

### OTT 기준

```
1. OTT 기준 선택 → 2. 식사 상황 선택 → 3. OTT 플랫폼 선택 → 영화 목록(장르·검색) → 추천 결과(영화+음식)
```

### 음식 기준

```
1. 음식 기준 선택 → 2. 식사 상황 선택 → 3. 음식 종류 선택 → 4. OTT 플랫폼 선택 → 추천 결과(음식+영화)
```

---

## 📁 프로젝트 구조

```text
OTT-Food_Match/
├── api/                    # Vercel Serverless Functions
│   ├── movies.js           # OTT별 영화 목록 조회
│   ├── movie-detail.js     # 영화 상세 정보
│   ├── food-recommend.js   # 음식 추천 로직
│   ├── ai-recommend.js     # Gemini AI 추천
│   ├── match-reason.js     # 조합 이유 생성
│   ├── personalize.js      # 사용자 취향 프로필
│   └── food_data.js        # 음식 데이터
├── icons/                  # PWA 아이콘
│   ├── icon-192.png
│   └── icon-512.png
├── images/                 # OTT 로고 이미지
├── index.html              # 메인 페이지 (위저드 플로우)
├── movie.html              # 영화 목록 + 검색
├── recommend.html          # 추천 결과 상세
├── map.html                # Kakao 지도
├── mypage.html             # 마이페이지
├── firebase.js             # Firebase 설정 · 인증
├── script.js               # 메인 위저드 로직
├── movie.js                # 영화 목록 · 장르 필터 · 검색
├── recommend.js            # 추천 결과 렌더링 · 저장
├── map.js                  # 카카오맵 · 음식점 선택
├── mypage.js               # 마이페이지 로직
├── common.js               # 공통 유틸 · SW 등록
├── i18n.js                 # 다국어 텍스트
├── food.js                 # 음식 데이터
├── food-algorithm.js       # 음식 추천 알고리즘
├── styles.css              # 전체 스타일
├── manifest.json           # PWA 웹 앱 매니페스트
└── sw.js                   # Service Worker
```

테스트 코드는 메인 프로젝트와 분리된 `OTT-Food_Match_test/` 폴더에서 관리합니다.

```text
OTT-Food_Match_test/
├── package.json
├── movie-utils.js / movieUtils.test.js
├── map-utils.js / mapUtils.test.js
├── recommend-match-utils.js / recommendMatch.test.js
└── README.md
```

---

## 🚀 로컬 실행

### 사전 요구 사항

- Node.js 20.x LTS 이상
- npm 10.x 이상

### 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
TMDB_API_KEY=<YOUR_TMDB_API_KEY>
Gemini_API=<YOUR_GEMINI_API_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
```

> API Key 발급 방법은 [이슈 #102](https://github.com/kjh3291/OTT-Food_Match/issues/102)를 참고하세요.  
> Kakao Maps Key는 `map.html`의 SDK 로드 URL에 직접 설정합니다.

### 실행

```bash
git clone https://github.com/kjh3291/OTT-Food_Match.git
cd OTT-Food_Match

# 최초 1회 또는 로그인이 필요한 경우
npx vercel login

# 로컬 개발 서버
npx vercel dev
```

실행 후 `http://localhost:3000` 에서 확인합니다.

### API 동작 확인

```bash
# 영화 목록
curl "http://localhost:3000/api/movies?ott=netflix&genre=전체&lang=ko-KR&page=1"

# 영화 상세
curl "http://localhost:3000/api/movie-detail?movieId=550&lang=ko-KR"
```

---

## 🧪 테스트

### Jest 단위 테스트

```bash
cd OTT-Food_Match_test
npm install
npm test
npm run coverage
```

커버리지 리포트: `coverage/lcov-report/index.html`

### 브라우저 Smoke Test

| 테스트 항목 | 기대 결과 |
|------------|----------|
| 메인 페이지 접속 | 위저드 카드와 추천 기준 선택 버튼 표시 |
| OTT 기준 플로우 | OTT 선택 → 영화 목록 → 추천 결과 이동 |
| 음식 기준 플로우 | 음식 선택 → OTT 선택 → 영화 목록 → 추천 결과 이동 |
| 영화 검색 | 입력 즉시 제목 필터 적용, 장르 변경 시 초기화 |
| 조합 저장 | Firestore 저장 후 메인 화면 목록 반영 |
| 마이페이지 | 로그인 시 통계 · 저장 조합 렌더링 |
| PWA 설치 | Chrome 주소창 설치 아이콘 표시 |

---

## 🖼 실행 화면

### 메인 화면
![메인 화면](https://github.com/user-attachments/assets/469d2950-25bb-4847-b983-0ebc9cf60b21)

### 영화 목록 화면 (장르 필터 + 검색)
![영화 목록 화면](https://github.com/user-attachments/assets/dfe602d5-f4d7-4a8c-9920-a2a2ea2e006a)

### 추천 결과 화면
![추천 결과 화면](https://github.com/user-attachments/assets/41e6eb14-08da-4d90-9c9a-05a8975ee576)

### 지도 화면
![지도 화면](https://github.com/user-attachments/assets/3acae357-71cb-4fac-af66-a7d75d4f8366)

---

## ⚠️ 주의 사항

- `.env.local`, API Key, Vercel 인증 정보는 GitHub에 업로드하지 않습니다.
- Kakao Maps Key와 Firebase 설정값은 프론트엔드에 노출되므로 Kakao Developers 도메인 제한 및 Firebase 보안 규칙으로 사용 범위를 제한합니다.
- Kakao Map 로컬 실행 시 Kakao Developers에 `http://localhost:3000`을 사이트 도메인으로 등록해야 합니다.
- macOS 환경에서 `.DS_Store`, `__MACOSX`는 `.gitignore`에 추가하는 것을 권장합니다.

---

## 👥 Contributors

| 이름 | 역할 |
|------|------|
| 김재하 | 팀장 · Backend · Algorithm · Server |
| 서종혁 | API · Firebase |
| 김동효 | Algorithm · Backend |
| 오경원 | Frontend |

---

## License

MIT License © 2026 OTT-Food_Match Contributors
