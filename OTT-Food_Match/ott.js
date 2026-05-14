// ===============================
// 1. 기본 설정
// ===============================

const ottNameMap = {
  netflix: "넷플릭스",
  disney: "디즈니+",
  tving: "티빙",
  wavve: "웨이브",
};

// TMDB Watch Provider ID
// 주의: 티빙, 웨이브는 TMDB 데이터 상황에 따라 결과가 적거나 없을 수 있음
const ottProviderMap = {
  netflix: 8,     // Netflix
  disney: 337,   // Disney Plus
  wavve: 356,    // wavve
  tving: 97,     // TVING으로 시도
};

const genreIdMap = {
  "액션": 28,
  "코미디": 35,
  "드라마": 18,
  "로맨스": 10749,
  "스릴러": 53,
  "애니메이션": 16,
};

const selections = {
  genre: "",
  meal: "",
};

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");


// ===============================
// 2. HTML 요소 가져오기
// ===============================

const ottTitle = document.getElementById("ottTitle");
const optionButtons = document.querySelectorAll(".option-btn");
const recommendContentBtn = document.getElementById("recommendContentBtn");
const contentSection = document.getElementById("contentSection");
const contentList = document.getElementById("contentList");
const backBtn = document.getElementById("backBtn");

const foodRecommendSection = document.getElementById("foodRecommendSection");
const selectedContentTitle = document.getElementById("selectedContentTitle");
const selectedContentInfo = document.getElementById("selectedContentInfo");
const aiFoodResult = document.getElementById("aiFoodResult");


// ===============================
// 3. 초기 화면 설정
// ===============================

const ottName = ottNameMap[ottKey] || "OTT";
ottTitle.textContent = `${ottName} 콘텐츠 추천`;


// ===============================
// 4. TMDB API 연결 테스트
// ===============================

async function testTMDBAPI() {
  const apiKey = window.CONFIG?.TMDB_API_KEY;

  if (!apiKey) {
    console.error("TMDB API Key가 없습니다. config.js를 확인하세요.");
    return;
  }

  const testUrl = `${window.CONFIG.TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=ko-KR`;

  try {
    const response = await fetch(testUrl);

    if (!response.ok) {
      console.error("TMDB API 연결 실패:", response.status);
      return;
    }

    const data = await response.json();
    console.log("TMDB API 연결 성공");
    console.log("장르 데이터:", data.genres);
  } catch (error) {
    console.error("TMDB API 테스트 중 오류 발생:", error);
  }
}

testTMDBAPI();


// ===============================
// 5. 장르 / 식사 상황 선택 기능
// ===============================

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;

    selections[type] = value;

    document
      .querySelectorAll(`.option-btn[data-type="${type}"]`)
      .forEach((btn) => btn.classList.remove("selected"));

    button.classList.add("selected");

    contentSection.classList.add("hidden");
    foodRecommendSection.classList.add("hidden");
  });
});


// ===============================
// 6. TMDB에서 영화 목록 가져오기
// ===============================

async function fetchMoviesFromTMDB(genre, ottKey) {
  const apiKey = window.CONFIG?.TMDB_API_KEY;
  const baseUrl = window.CONFIG?.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!apiKey) {
    alert("TMDB API Key가 없습니다. config.js를 확인해주세요.");
    return [];
  }

  const genreId = genreIdMap[genre];
  const providerId = ottProviderMap[ottKey];

  if (!genreId) {
    alert(`${genre} 장르는 현재 영화 API 검색에서 지원하지 않습니다.`);
    return [];
  }

  if (!providerId) {
    alert("선택한 OTT의 Provider ID가 없습니다.");
    return [];
  }

  const url =
    `${baseUrl}/discover/movie` +
    `?api_key=${apiKey}` +
    `&language=ko-KR` +
    `&region=KR` +
    `&watch_region=KR` +
    `&with_watch_providers=${providerId}` +
    `&with_watch_monetization_types=flatrate` +
    `&with_genres=${genreId}` +
    `&sort_by=popularity.desc` +
    `&include_adult=false` +
    `&page=1`;

  console.log("요청 URL:", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("TMDB 영화 목록 요청 실패:", response.status);
      alert("영화 목록을 불러오지 못했습니다.");
      return [];
    }

    const data = await response.json();
    console.log("TMDB 영화 목록 결과:", data);

    return data.results.map((movie) => ({
      id: movie.id,
      title: movie.title || movie.name || "제목 없음",
      genre: genre,
      overview: movie.overview || "줄거리 정보가 없습니다.",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "개봉일 정보 없음",
      rating: movie.vote_average,
    }));
  } catch (error) {
    console.error("TMDB API 요청 중 오류 발생:", error);
    alert("API 요청 중 오류가 발생했습니다.");
    return [];
  }
}


// ===============================
// 7. 콘텐츠 추천 버튼
// ===============================

recommendContentBtn.addEventListener("click", async () => {
  const { genre, meal } = selections;

  if (!genre || !meal) {
    alert("장르와 식사 상황을 모두 선택해주세요.");
    return;
  }

  contentList.innerHTML = `
    <div class="result-card">
      <p>영화 목록을 불러오는 중입니다...</p>
    </div>
  `;

  contentSection.classList.remove("hidden");
  foodRecommendSection.classList.add("hidden");

  const movies = await fetchMoviesFromTMDB(genre, ottKey);

  renderTMDBMovies(movies, genre, meal);
});


// ===============================
// 8. 영화 목록 화면 출력
// ===============================

function renderTMDBMovies(movies, genre, meal) {
  if (!movies || movies.length === 0) {
    contentList.innerHTML = `
      <div class="result-card">
        <p>선택한 조건에 맞는 영화가 없습니다.</p>
        <p style="color:#666; margin-top:8px;">
          다른 장르를 선택하거나, OTT를 바꿔서 다시 시도해보세요.
        </p>
      </div>
    `;
    return;
  }

  contentList.innerHTML = movies
    .slice(0, 10)
    .map((movie, index) => {
      const posterUrl = movie.posterPath
        ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
        : "";

      return `
        <div class="result-item">
          ${
            posterUrl
              ? `<img src="${posterUrl}" alt="${movie.title} 포스터" style="width:120px; border-radius:10px; margin-bottom:10px;">`
              : ""
          }

          <strong>${movie.title}</strong>
          <p>장르: ${genre}</p>
          <p>개봉일: ${movie.releaseDate}</p>
          <p>평점: ${movie.rating ? movie.rating.toFixed(1) : "정보 없음"}</p>
          <p>${movie.overview}</p>

          <button class="primary-btn food-recommend-btn" data-index="${index}">
            이 콘텐츠에 어울리는 음식 추천받기
          </button>
        </div>
      `;
    })
    .join("");

  const foodRecommendButtons = document.querySelectorAll(".food-recommend-btn");

  foodRecommendButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.dataset.index);
      const selectedMovie = movies[selectedIndex];

      const contentForFood = {
        title: selectedMovie.title,
        genre: genre,
        description: selectedMovie.overview,
        mealTags: [meal],
      };

      recommendFoodForContent(contentForFood);
    });
  });

  contentSection.classList.remove("hidden");
  foodRecommendSection.classList.add("hidden");
}


// ===============================
// 9. 음식 추천 기능
// ===============================

function recommendFoodForContent(content) {
  let foodRecommendation = {
    name: "치킨 + 콜라",
    reason: "대부분의 콘텐츠와 무난하게 잘 어울리는 조합입니다.",
  };

  if (content.genre === "스릴러") {
    foodRecommendation = {
      name: "피자 + 콜라",
      reason: "스릴러는 긴장감이 강하기 때문에 손쉽게 먹을 수 있는 피자가 잘 어울립니다.",
    };
  } else if (content.genre === "코미디") {
    foodRecommendation = {
      name: "떡볶이 + 튀김",
      reason: "가볍고 즐거운 분위기의 콘텐츠에는 부담 없이 먹기 좋은 분식 조합이 잘 맞습니다.",
    };
  } else if (content.genre === "드라마") {
    foodRecommendation = {
      name: "우동",
      reason: "드라마의 잔잔한 감정선과 따뜻한 국물 음식이 잘 어울립니다.",
    };
  } else if (content.genre === "로맨스") {
    foodRecommendation = {
      name: "파스타 + 샐러드",
      reason: "로맨틱한 분위기에는 깔끔하고 분위기 있는 음식이 잘 어울립니다.",
    };
  } else if (content.genre === "액션") {
    foodRecommendation = {
      name: "치킨 + 감자튀김",
      reason: "액션 콘텐츠의 빠르고 강한 분위기에는 든든하고 자극적인 음식이 잘 어울립니다.",
    };
  } else if (content.genre === "애니메이션") {
    foodRecommendation = {
      name: "햄버거 세트",
      reason: "가족이나 친구와 편하게 보기 좋은 애니메이션에는 간단하고 대중적인 음식이 잘 어울립니다.",
    };
  }

  selectedContentTitle.textContent = `선택한 콘텐츠: ${content.title}`;
  selectedContentInfo.textContent = `장르: ${content.genre} / ${content.description}`;

  aiFoodResult.innerHTML = `
    <div class="result-item">
      <strong>🍔 추천 음식: ${foodRecommendation.name}</strong>
      <p>${foodRecommendation.reason}</p>
    </div>
  `;

  foodRecommendSection.classList.remove("hidden");
}


// ===============================
// 10. 뒤로가기 버튼
// ===============================

backBtn.addEventListener("click", () => {
  window.location.href = "main.html";
});