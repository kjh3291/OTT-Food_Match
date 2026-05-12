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
const ottProviderMap = {
  netflix: 8,
  disney: 337,
  wavve: 356,
  tving: 97,
};

const genreIdMap = {
  "액션": 28,
  "코미디": 35,
  "드라마": 18,
  "로맨스": 10749,
  "스릴러": 53,
  "애니메이션": 16,
};


// ===============================
// 2. URL 값 가져오기
// ===============================

const urlParams = new URLSearchParams(window.location.search);

const ottKey = urlParams.get("ott");
const selectedGenres = urlParams.get("genres")
  ? decodeURIComponent(urlParams.get("genres")).split(",")
  : [];
const selectedMeal = urlParams.get("meal")
  ? decodeURIComponent(urlParams.get("meal"))
  : "";


// ===============================
// 3. HTML 요소 가져오기
// ===============================

const moviePageTitle = document.getElementById("moviePageTitle");
const moviePageInfo = document.getElementById("moviePageInfo");
const loadingText = document.getElementById("loadingText");
const movieList = document.getElementById("movieList");
const backToSelectBtn = document.getElementById("backToSelectBtn");


// ===============================
// 4. 초기 화면 설정
// ===============================

const ottName = ottNameMap[ottKey] || "OTT";

moviePageTitle.textContent = `${ottName} 영화 추천`;
moviePageInfo.textContent = `선택 장르: ${selectedGenres.join(", ")} / 식사 상황: ${selectedMeal}`;

if (!ottKey) {
  alert("OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.");
  window.location.href = "main.html";
}

// ===============================
// 5. TMDB 영화 목록 가져오기
// ===============================

async function fetchMoviesFromTMDB() {
  const apiKey = window.CONFIG?.TMDB_API_KEY;
  const baseUrl = window.CONFIG?.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!apiKey) {
    alert("TMDB API Key가 없습니다. config.js를 확인해주세요.");
    return [];
  }

  const providerId = ottProviderMap[ottKey];

  if (!providerId) {
    alert("선택한 OTT의 Provider ID가 없습니다.");
    return [];
  }

  const genreIds = selectedGenres
    .map((genre) => genreIdMap[genre])
    .filter((id) => id !== undefined);

  if (genreIds.length === 0) {
    alert("선택한 장르가 영화 API 검색에서 지원되지 않습니다.");
    return [];
  }

  // 여러 장르를 OR 조건으로 검색하기 위해 쉼표로 연결
  const genreQuery = genreIds.join(",");

  const url =
    `${baseUrl}/discover/movie` +
    `?api_key=${apiKey}` +
    `&language=ko-KR` +
    `&region=KR` +
    `&watch_region=KR` +
    `&with_watch_providers=${providerId}` +
    `&with_watch_monetization_types=flatrate` +
    `&with_genres=${genreQuery}` +
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
      overview: movie.overview || "줄거리 정보가 없습니다.",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "개봉일 정보 없음",
      rating: movie.vote_average,
      genreIds: movie.genre_ids || [],
    }));
  } catch (error) {
    console.error("TMDB API 요청 중 오류 발생:", error);
    alert("API 요청 중 오류가 발생했습니다.");
    return [];
  }
}


// ===============================
// 6. 영화 목록 출력
// ===============================

function renderMovies(movies) {
  loadingText.classList.add("hidden");

  if (!movies || movies.length === 0) {
    movieList.innerHTML = `
      <div class="result-card">
        <p>선택한 조건에 맞는 영화가 없습니다.</p>
        <p style="color:#666; margin-top:8px;">
          다른 장르를 선택하거나 OTT를 바꿔서 다시 시도해보세요.
        </p>
      </div>
    `;
    return;
  }

  movieList.innerHTML = movies
    .slice(0, 12)
    .map((movie, index) => {
      const posterUrl = movie.posterPath
        ? `https://image.tmdb.org/t/p/w300${movie.posterPath}`
        : "";

      return `
        <div class="movie-card" data-index="${index}">
          <div class="movie-poster-area">
            ${
              posterUrl
                ? `<img src="${posterUrl}" alt="${movie.title} 포스터" class="movie-poster">`
                : `<div class="no-poster">포스터 없음</div>`
            }
          </div>

          <div class="movie-info">
            <strong>${movie.title}</strong>
            <p>개봉일: ${movie.releaseDate}</p>
            <p>평점: ${movie.rating ? movie.rating.toFixed(1) : "정보 없음"}</p>
          </div>

          <div class="movie-food-panel hidden" id="foodPanel-${index}"></div>
        </div>
      `;
    })
    .join("");

  const movieCards = document.querySelectorAll(".movie-card");

  movieCards.forEach((card) => {
    const posterArea = card.querySelector(".movie-poster-area");

    posterArea.addEventListener("click", () => {
      const selectedIndex = Number(card.dataset.index);
      const selectedMovie = movies[selectedIndex];

      closeAllFoodPanels();
      openFoodPanel(selectedMovie, selectedIndex);
    });
  });
}


// ===============================
// 7. 모든 음식 추천 패널 닫기
// ===============================

function closeAllFoodPanels() {
  const panels = document.querySelectorAll(".movie-food-panel");

  panels.forEach((panel) => {
    panel.classList.add("hidden");
    panel.innerHTML = "";
  });
}


// ===============================
// 8. 선택한 영화 아래 음식 추천 패널 열기
// ===============================

function openFoodPanel(movie, index) {
  const panel = document.getElementById(`foodPanel-${index}`);

  panel.innerHTML = `
    <div class="selected-movie-box">
      <h3>영화 선택</h3>
      <p><strong>${movie.title}</strong></p>
      <p style="margin-top: 6px;">
        이 영화를 선택하면 현재 장르와 식사 상황에 맞는 음식을 추천합니다.
      </p>

      <button class="primary-btn select-movie-btn" data-index="${index}">
        이 영화 선택하기
      </button>
    </div>

    <div class="food-result-box hidden" id="foodResult-${index}"></div>
  `;

  panel.classList.remove("hidden");

  const selectMovieBtn = panel.querySelector(".select-movie-btn");

  selectMovieBtn.addEventListener("click", () => {
    showFoodRecommendation(movie, index);
  });
}

function showFoodRecommendation(movie, index) {
  const foodResultBox = document.getElementById(`foodResult-${index}`);
  const foodRecommendation = recommendFood(movie);

  foodResultBox.innerHTML = `
    <h3>🍽 추천 음식</h3>
    <p><strong>${foodRecommendation.name}</strong></p>
    <p>${foodRecommendation.reason}</p>
  `;

  foodResultBox.classList.remove("hidden");
}


// ===============================
// 9. 음식 추천 규칙
// ===============================

function recommendFood(movie) {
  let foodRecommendation = {
    name: "치킨 + 콜라",
    reason: "대부분의 영화와 무난하게 어울리고, OTT를 보면서 먹기 편한 조합입니다.",
  };

  if (selectedGenres.includes("스릴러")) {
    foodRecommendation = {
      name: "피자 + 콜라",
      reason: "스릴러는 긴장감이 강하기 때문에 화면에 집중하면서 간단히 집어 먹을 수 있는 피자가 잘 어울립니다.",
    };
  }

  if (selectedGenres.includes("코미디")) {
    foodRecommendation = {
      name: "떡볶이 + 튀김",
      reason: "코미디 영화의 가볍고 즐거운 분위기에는 부담 없이 먹기 좋은 분식 조합이 잘 어울립니다.",
    };
  }

  if (selectedGenres.includes("드라마")) {
    foodRecommendation = {
      name: "우동",
      reason: "드라마의 잔잔한 감정선과 따뜻한 국물 음식이 잘 어울립니다.",
    };
  }

  if (selectedGenres.includes("로맨스")) {
    foodRecommendation = {
      name: "파스타 + 샐러드",
      reason: "로맨스 영화의 부드러운 분위기에는 깔끔하고 분위기 있는 음식이 잘 어울립니다.",
    };
  }

  if (selectedGenres.includes("액션")) {
    foodRecommendation = {
      name: "치킨 + 감자튀김",
      reason: "액션 영화의 빠르고 강한 분위기에는 든든하고 자극적인 음식이 잘 어울립니다.",
    };
  }

  if (selectedGenres.includes("애니메이션")) {
    foodRecommendation = {
      name: "햄버거 세트",
      reason: "애니메이션은 편하게 보기 좋은 경우가 많아서 간단하고 대중적인 햄버거 세트가 잘 어울립니다.",
    };
  }

  // 식사 상황에 따른 보정
  if (selectedMeal === "야식") {
    foodRecommendation.name += " + 탄산음료";
    foodRecommendation.reason += " 특히 야식 상황에서는 자극적이고 만족감 있는 조합이 잘 맞습니다.";
  }

  if (selectedMeal === "혼밥") {
    foodRecommendation.reason += " 혼자 볼 때도 준비가 간단하고 먹기 편한 음식입니다.";
  }

  if (selectedMeal === "친구와 함께") {
    foodRecommendation.reason += " 친구와 함께 나눠 먹기에도 좋은 메뉴입니다.";
  }

  if (selectedMeal === "연인과 함께") {
    foodRecommendation.reason += " 함께 먹을 때 분위기를 해치지 않는 조합입니다.";
  }

  if (selectedMeal === "간단한 식사") {
    foodRecommendation.reason += " 간단하게 먹기 좋은 상황에도 잘 맞습니다.";
  }

  if (selectedMeal === "든든한 식사") {
    foodRecommendation.reason += " 든든하게 먹고 싶을 때도 만족도가 높은 조합입니다.";
  }

  return foodRecommendation;
}


// ===============================
// 10. 뒤로가기 버튼
// ===============================

backToSelectBtn.addEventListener("click", () => {
  window.location.href = `ott.html?ott=${ottKey}`;
});


// ===============================
// 11. 실행
// ===============================

async function initMoviePage() {
  const movies = await fetchMoviesFromTMDB();
  renderMovies(movies);
}

initMoviePage();