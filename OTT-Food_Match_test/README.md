# OTT-Food_Match_test

`kjh3291/OTT-Food_Match` 메인 코드를 **수정하지 않고**, 순수 함수만 분리해 단위 테스트/커버리지를
측정하기 위한 폴더입니다. 실행 방법은 `실행방법.md`를 참고하세요.

## 테스트 대상 (단위 테스트 가능 — 입력→출력이 결정적인 순수 로직)

| 테스트 파일 | 대상 모듈 | 원본 | 검증 내용 |
|---|---|---|---|
| foodAlgorithm.test.js | food-algorithm.js | food-algorithm.js | convertFoods / recommend |
| recommendUtils.test.js | recommend-utils.js | recommend.js | 장르→카테고리, 카테고리 필터, 추천 사유 생성 |
| foodData.test.js | food-data.js | food.js | 7개 카테고리 데이터, 카테고리별 음식 조회 |
| movieUtils.test.js | movie-utils.js | movie.js | getGenreKey, 중복 제거, 정렬, 장르별 추천 음식 |
| mapUtils.test.js | map-utils.js | map.js | 검색 카테고리 코드 결정, 업종명 필터 |
| recommendMatchUtils.test.js | recommend-match-utils.js | recommend.js | 음식→장르 역매핑, 상황별 카테고리 매칭 |
| i18nUtils.test.js | i18n-utils.js | i18n.js | getLang, 번역 조회/폴백 |
| scriptUtils.test.js | script-utils.js | script.js | OTT명→파라미터, 유사 장르, 장르 키 |

## 단위 테스트에서 제외한 부분과 이유

- **Firebase 인증·DB(저장/삭제/동기화)** — `recommend.js`, `script.js`, `firebase.js`
  외부 서비스(네트워크·인증)에 의존. 결과가 계정/서버 상태에 좌우되어 결정적 검증 불가.
- **TMDB API 호출** (`fetchMovieDetailById`, `fetchRandomMovie`, `fetchMoviesFromTMDB`, `fetchAiPicksFromServer`)
  `fetch` 네트워크 I/O 의존. 외부 응답에 따라 결과가 달라짐.
- **DOM 렌더링/이벤트** (`renderMovies`, `renderRecommendDetail`, `renderSavedCombosOnMain`,
  `applyLanguage`, 모든 addEventListener) — 실제 DOM/HTML이 있어야 동작. 브라우저(jsdom) 기반
  테스트가 별도로 필요해 순수 단위 테스트 범위 밖.
- **카카오맵 SDK 전체** (`new kakao.maps.Map`, 마커/인포윈도우, 지도 이벤트) — `map.js`
  전역 `kakao` 객체와 지도 컨테이너가 로딩 시점에 필요. SDK 미로딩 시 즉시 오류.
  → 필터 "로직"만 `map-utils.js`로 분리해 테스트함.
- **브라우저 위치(geolocation)** — `map.js`. 권한·실제 위치 의존, 자동 테스트 불가.
- **localStorage 기반 플로우**(히스토리/리액션/테마 저장) — 브라우저 저장소 의존.
  (단, i18n의 getLang/t는 가벼운 목으로 대체 가능해 테스트에 포함.)
- **이미지 캡처 공유**(`html2canvas`) — 외부 라이브러리 + canvas 렌더링 의존.
- **window.location 페이지 이동** — 실제 내비게이션 부수효과.
  → URL 조립 "규칙"(`mapOttNameToParam` 등)만 분리해 테스트함.

즉, 데이터 변환·매칭·정렬·필터·번역 조회처럼 **결정적인 순수 로직만** 테스트하고,
네트워크·DB·DOM·외부 SDK·브라우저 API 의존 코드는 제외했습니다.

## 주의

- `i18n-utils.js`의 `i18nData`는 테스트용 대표 키만 옮겨둔 축약본입니다.
  전체 키를 검증하려면 원본 `i18n.js`의 `i18nData`를 그대로 붙여넣으면 됩니다(로직 동일).
- `node_modules/`, `coverage/`는 `npm install` / `npm run coverage` 시 자동 생성되므로
  배포/공유 시 제외해도 됩니다.
