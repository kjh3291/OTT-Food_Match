# 🍿 OTT-Food_Match

OTT 플랫폼에서 볼 영화를 선택하면 영화의 분위기와 사용자의 식사 상황에 맞는 음식을 추천하고, Kakao Map을 통해 주변 음식점 탐색까지 연결하는 웹 서비스입니다.

---

## 주요 기능

* Netflix, Disney+, TVING, wavve 기반 영화 목록 조회
* TMDB API를 이용한 영화 목록 및 영화 상세 정보 제공
* 장르별 영화 필터링 및 영화 카드 UI 제공
* 영화 분위기와 식사 상황을 반영한 음식 추천
* Gemini API를 활용한 AI 추천 사유 생성
* LocalStorage 기반 추천 조합 저장
* Firebase 기반 로그인 및 저장 조합 동기화
* Kakao Maps API 기반 주변 음식점 검색
* 한국어, 영어, 중국어, 일본어 다국어 화면 지원

---

## 실행 환경 및 의존성

| 항목        | 버전 / 조건                            | 설명                             |
| --------- | ---------------------------------- | ------------------------------ |
| OS        | Windows 10/11, macOS, Linux        | 일반 웹 브라우저 실행 환경                |
| Node.js   | 20.x LTS 이상 권장                     | Vercel Serverless Functions 실행 |
| npm       | 10.x 이상 권장                         | `npx vercel dev` 실행            |
| Browser   | Chrome, Edge, Safari 최신 버전 권장      | 웹 화면 확인                        |
| Frontend  | HTML5, CSS3, Vanilla JavaScript    | React, Vue, Angular 미사용        |
| Backend   | Vercel Serverless Functions        | `/api` 폴더의 API 실행              |
| Auth / DB | Firebase Authentication, Firestore | 로그인 및 저장 조합 동기화                |

`/api` 폴더의 Vercel Serverless Functions를 로컬에서 실행하기 위해 Node.js와 npm 실행 환경이 필요합니다.

또한 처음 `npx vercel dev`를 실행하는 경우 Vercel CLI 설치 여부를 묻거나 Vercel 로그인을 요구할 수 있습니다.

### 외부 API 의존성

| API            | 사용 목적                  | 필요 Key / 환경변수                  |
| -------------- | ---------------------- | ------------------------------ |
| TMDB API       | OTT별 영화 목록 및 상세 정보 조회  | `TMDB_API_KEY`                 |
| Gemini API     | AI 추천 사유 및 음식 추천 생성    | `Gemini_API`, `GEMINI_API_KEY` |
| Kakao Maps API | 지도 표시 및 주변 음식점 검색      | Kakao JavaScript Key           |
| Firebase       | Google 로그인 및 저장 조합 동기화 | `firebase.js` 설정값              |

> 각 API Key 발급 방법은 아래 이슈에 정리되어 있습니다.
> https://github.com/kjh3291/OTT-Food_Match/issues/102

## 설치 방법

```bash
git clone https://github.com/kjh3291/OTT-Food_Match.git
cd OTT-Food_Match
```

Node.js와 npm 설치 여부를 확인합니다.

```bash
node -v
npm -v
```

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```bash
# macOS / Linux
touch .env.local

# Windows PowerShell
New-Item .env.local
```

`.env.local` 예시는 다음과 같습니다.

```env
TMDB_API_KEY=<YOUR_TMDB_API_KEY>
Gemini_API=<YOUR_GEMINI_API_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
```

API Key 발급 방법은 아래 이슈를 참고합니다.

```text
https://github.com/kjh3291/OTT-Food_Match/issues/102
```

Kakao Map을 사용하는 경우 `map.html`의 Kakao JavaScript Key를 본인의 Key로 설정합니다.

```html
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=<YOUR_KAKAO_JAVASCRIPT_KEY>&libraries=services"></script>
```

또한 Kakao Developers의 Web 플랫폼 사이트 도메인에 로컬 실행 주소를 등록해야 합니다.

```text
http://localhost:3000
http://127.0.0.1:3000
```

이 주소가 등록되어 있지 않으면 로컬 실행 시 Kakao Map이 정상적으로 표시되지 않을 수 있습니다.

---

## 사용 및 실행 방법

Live Server만으로 실행하면 `/api` 서버리스 함수가 동작하지 않을 수 있으므로, 프로젝트 루트에서 Vercel 개발 서버를 실행합니다.

```bash
# 최초 1회 또는 로그인이 필요한 경우
npx vercel login

# 로컬 개발 서버 실행
npx vercel dev
```

Vercel 로그인이 이미 되어 있다면 `npx vercel dev`만 실행해도 됩니다.

실행 후 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

사용 흐름은 다음과 같습니다.

1. 메인 화면에서 추천 기준을 선택합니다: 볼 콘텐츠(OTT) 기준 또는 먹을 음식 메뉴 기준
2. 현재 식사 상황을 선택합니다.
3. OTT 기준을 선택한 경우, 이용 중인 OTT 플랫폼을 선택한 뒤 영화 목록 페이지로 이동합니다.
4. 음식 기준을 선택한 경우, 이용 중인 OTT 플랫폼을 선택한 뒤 지도 페이지로 이동합니다.
5. 영화 또는 음식점을 선택하면 추천 결과 페이지에서 추천 음식 또는 추천 영화를 확인할 수 있습니다.
6. 마음에 드는 조합은 저장하여 메인 화면에서 다시 확인할 수 있습니다.

---

## Unit Test 및 동작 검증 방법

메인 프로젝트(`OTT-Food_Match/`)는 HTML, CSS, Vanilla JavaScript와 Vercel Serverless Functions를 중심으로 구성되어 있습니다.
메인 프로젝트 폴더에는 별도의 테스트 프레임워크를 포함하지 않으며, 브라우저 실행과 API 호출을 통해 동작을 확인합니다.

단위 테스트는 별도 폴더인 `OTT-Food_Match_test/`에서 Jest 기반으로 실행합니다.
이 테스트 폴더는 메인 코드의 DOM, fetch, LocalStorage, Firebase, Kakao Map SDK 같은 브라우저/외부 의존성을 제외하고, 순수 로직 함수만 분리하여 검증합니다.

### 1. 메인 프로젝트 로컬 실행

```bash
cd OTT-Food_Match

# 최초 1회 또는 로그인이 필요한 경우
npx vercel login

# 로컬 개발 서버 실행
npx vercel dev
```

Vercel 로그인이 이미 되어 있다면 `npx vercel dev`만 실행해도 됩니다.

실행 후 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

### 2. API 동작 확인

영화 목록 API를 확인합니다.

```bash
curl "http://localhost:3000/api/movies?ott=netflix&genre=전체&lang=ko-KR&page=1"
```

정상 동작 시 `page`, `totalPages`, `movies`가 포함된 JSON 응답이 반환됩니다.

영화 상세 API를 확인합니다.

```bash
curl "http://localhost:3000/api/movie-detail?movieId=550&lang=ko-KR"
```

정상 동작 시 영화 제목, 줄거리, 포스터 경로, 평점 등이 포함된 JSON 응답이 반환됩니다.

### 3. Jest 단위 테스트 실행

단위 테스트 폴더로 이동합니다.

```bash
cd ../OTT-Food_Match_test
npm install
npm test
npm run coverage
```

`npm test`는 전체 테스트 통과 여부를 확인하고, `npm run coverage`는 테스트 커버리지를 측정합니다.

커버리지 결과는 터미널에 표 형태로 출력되며, 추가로 아래 HTML 리포트에서도 확인할 수 있습니다.

```text
coverage/lcov-report/index.html
```

### 4. 브라우저 Smoke Test

| 테스트 항목    | 기대 결과                          |
| --------- | ------------------------------ |
| 메인 페이지 접속 | 메인 화면과 추천 기준 선택 카드 표시          |
| OTT 기준 선택 | 식사 상황 선택 후 OTT 선택 단계로 이동       |
| 음식 기준 선택  | 식사 상황 선택 후 OTT 선택 및 지도 페이지로 이동 |
| 영화 목록 조회  | 선택한 OTT와 장르에 맞는 영화 카드 표시       |
| 영화 클릭     | 추천 결과 페이지로 이동                  |
| 추천 결과 확인  | 추천 음식 또는 추천 영화와 추천 사유 표시       |
| 조합 저장     | 저장한 조합이 메인 화면에 표시              |
| 지도 페이지 이동 | Kakao Map과 주변 음식점 검색 결과 표시     |

---

## 실행 화면

### 메인 화면

![메인 화면](https://github.com/user-attachments/assets/469d2950-25bb-4847-b983-0ebc9cf60b21)

### 영화 목록 화면

![영화 목록 화면](https://github.com/user-attachments/assets/dfe602d5-f4d7-4a8c-9920-a2a2ea2e006a)

### 추천 결과 화면

![추천 결과 화면](https://github.com/user-attachments/assets/41e6eb14-08da-4d90-9c9a-05a8975ee576)

### 지도 화면

![지도 화면](https://github.com/user-attachments/assets/3acae357-71cb-4fac-af66-a7d75d4f8366)

---

## 프로젝트 구조

```text
OTT-Food_Match/
├── api/                  # Vercel Serverless Functions
│   ├── movies.js
│   ├── movie-detail.js
│   ├── food-recommend.js
│   ├── ai-recommend.js
│   ├── match-reason.js
│   ├── food_data.js
│   └── personalize.js
├── images/               # OTT 로고 이미지
├── index.html            # 메인 페이지
├── movie.html            # 영화 목록 페이지
├── recommend.html        # 추천 결과 페이지
├── map.html              # 지도 페이지
├── firebase.js           # Firebase 설정 및 인증 관련 코드
├── script.js             # 메인 화면 및 저장 조합 관리 로직
├── movie.js              # 영화 목록 조회 및 장르 필터링 로직
├── recommend.js          # 추천 결과 화면 로직
├── map.js                # Kakao Map 및 음식점 선택 로직
├── food.js               # 음식 데이터
├── food-algorithm.js     # 음식 추천 알고리즘
├── i18n.js               # 다국어 텍스트 관리
├── styles.css            # 전체 스타일
└── README.md
```

테스트 코드는 메인 프로젝트와 분리된 `OTT-Food_Match_test/` 폴더에서 관리합니다.

```text
OTT-Food_Match_test/
├── package.json
├── movie-utils.js
├── movieUtils.test.js
├── map-utils.js
├── mapUtils.test.js
├── recommend-match-utils.js
├── recommendMatch.test.js
└── README.md
```

---

## OS별 주의 사항

* `.DS_Store`와 `__MACOSX`는 macOS에서 자동 생성되는 파일입니다. 프로젝트 실행에 필요하지 않으며 GitHub 업로드 대상에서 제외하는 것이 좋습니다.
* `.env.local`, TMDB API Key, Gemini API Key, Vercel 인증 정보는 GitHub에 업로드하지 않습니다.
* Kakao Maps JavaScript Key와 Firebase 웹 설정값은 프론트엔드에서 사용되므로 코드상에 노출될 수 있습니다. 대신 Kakao Developers의 도메인 제한, Firebase Authentication 승인 도메인, Firestore 보안 규칙을 통해 사용 범위를 제한합니다.
* Kakao Map을 로컬에서 확인하려면 Kakao Developers에 `http://localhost:3000`을 사이트 도메인으로 등록해야 합니다.

---

## Contributors

| Contributor Name | 실명  | 역할                             |
| ---------------- | --- | ------------------------------ |
| 김재하              | 김재하 | 팀장, Backend, Algorithm, Server |
| 서종혁              | 서종혁 | API, Firebase                  |
| 김동효              | 김동효 | Algorithm, Backend             |
| 오경원              | 오경원 | Frontend                       |

---

## License

MIT License

Copyright (c) 2026 OTT-Food_Match Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions of the MIT License.
