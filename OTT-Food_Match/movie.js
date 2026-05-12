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

let selectedGenre = "액션";
let currentMovies = [];


// ===============================
// 2. URL 값 가져오기
// ===============================

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");

const selectedMeal = urlParams.get("meal")
  ? decodeURIComponent(urlParams.get("meal"))
  : "";


// ===============================
// 3. HTML 요소 가져오기
// ===============================

const moviePageTitle = document.getElementById("moviePageTitle");
const moviePageInfo = document.getElementById("moviePageInfo");
const genreTabs = document.querySelectorAll(".genre-tab");
const selectedGenreTitle = document.getElementById("selectedGenreTitle");
const loadingText = document.getElementById("loadingText");
const movieList = document.getElementById("movieList");
const backToMainBtn = document.getElementById("backToMainBtn");


// ===============================
// 4. 초기 화면 설정
// ===============================

const ottName = ottNameMap[ottKey] || "OTT";

if (!ottKey) {
  alert("OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.");
  window.location.href = "main.html";
}

moviePageTitle.textContent = `${ottName} 영화`;
moviePageInfo.textContent = `식사 상황: ${selectedMeal} / 상단 장르 버튼을 선택하면 해당 장르의 영화만 표시됩니다.`;


// ===============================
// 5. 장르 버튼 클릭 기능
// ===============================

genreTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    const genre = tab.dataset.genre;

    selectedGenre = genre;

    genreTabs.forEach((btn) => btn.classList.remove("selected"));
    tab.classList.add("selected");

    selectedGenreTitle.textContent = `${selectedGenre} 영화`;

    await loadMoviesByGenre(selectedGenre);
  });
});


// ===============================
// 6. 장르별 영화 불러오기
// ===============================

async function loadMoviesByGenre(genre) {
  loadingText.classList.remove("hidden");
  loadingText.textContent = "영화 목록을 불러오는 중입니다...";
  movieList.innerHTML = "";

  const movies = await fetchMoviesFromTMDB(genre);
  currentMovies = movies;

  renderMovies(currentMovies);
}


// ===============================
// 7. TMDB 영화 목록 가져오기
// ===============================

async function fetchMoviesFromTMDB(genre) {
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

  const genreId = genreIdMap[genre];

  if (!genreId) {
    alert("지원하지 않는 장르입니다.");
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
// 8. 영화 목록 출력
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

          <div class="movie-detail-panel hidden" id="movieDetailPanel-${index}"></div>
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

      closeAllDetailPanels();
      openMovieDetailPanel(selectedMovie, selectedIndex);
    });
  });
}


// ===============================
// 9. 모든 영화 설명 패널 닫기
// ===============================

function closeAllDetailPanels() {
  const panels = document.querySelectorAll(".movie-detail-panel");

  panels.forEach((panel) => {
    panel.classList.add("hidden");
    panel.innerHTML = "";
  });
}


// ===============================
// 10. 영화 설명 + 음식 추천 패널 열기
// ===============================

function openMovieDetailPanel(movie, index) {
  const panel = document.getElementById(`movieDetailPanel-${index}`);
  const foodRecommendation = recommendFood(movie);

  panel.innerHTML = `
    <div class="selected-movie-box">
      <h3>🎬 영화 설명</h3>
      <p><strong>${movie.title}</strong></p>
      <p>${movie.overview}</p>
    </div>

    <div class="food-result-box">
      <h3>🍽 추천 음식</h3>
      <p><strong>${foodRecommendation.name}</strong></p>
      <p>${foodRecommendation.reason}</p>
    </div>
  `;

  panel.classList.remove("hidden");
}


// ===============================
// 11. 음식 추천 규칙
// ===============================

function recommendFood(movie) {
  let foodRecommendation = {
    name: "치킨 + 콜라",
    reason: "OTT를 보면서 먹기 편하고 대부분의 영화와 무난하게 어울리는 조합입니다.",
  };

  if (selectedGenre === "스릴러") {
    foodRecommendation = {
      name: "피자 + 콜라",
      reason: "스릴러 영화는 긴장감이 강하기 때문에 화면에 집중하면서 간단히 집어 먹을 수 있는 피자가 잘 어울립니다.",
    };
  }

  if (selectedGenre === "코미디") {
    foodRecommendation = {
      name: "떡볶이 + 튀김",
      reason: "코미디 영화의 가볍고 즐거운 분위기에는 부담 없이 먹기 좋은 분식 조합이 잘 어울립니다.",
    };
  }

  if (selectedGenre === "드라마") {
    foodRecommendation = {
      name: "우동",
      reason: "드라마 영화의 잔잔한 감정선과 따뜻한 국물 음식이 잘 어울립니다.",
    };
  }

  if (selectedGenre === "로맨스") {
    foodRecommendation = {
      name: "파스타 + 샐러드",
      reason: "로맨스 영화의 부드러운 분위기에는 깔끔하고 분위기 있는 음식이 잘 어울립니다.",
    };
  }

  if (selectedGenre === "액션") {
    foodRecommendation = {
      name: "치킨 + 감자튀김",
      reason: "액션 영화의 빠르고 강한 분위기에는 든든하고 자극적인 음식이 잘 어울립니다.",
    };
  }

  if (selectedGenre === "애니메이션") {
    foodRecommendation = {
      name: "햄버거 세트",
      reason: "애니메이션은 편하게 보기 좋은 경우가 많아서 간단하고 대중적인 햄버거 세트가 잘 어울립니다.",
    };
  }

  return foodRecommendation;
}

if (selectedMeal === "야식") {
  foodRecommendation.name += " + 탄산음료";
  foodRecommendation.reason += " 야식 상황에서는 자극적이고 만족감 있는 조합이 잘 어울립니다.";
}

if (selectedMeal === "혼밥") {
  foodRecommendation.reason += " 혼자 볼 때도 준비가 간단하고 먹기 편한 메뉴입니다.";
}

if (selectedMeal === "친구와 함께") {
  foodRecommendation.reason += " 친구와 함께 나눠 먹기 좋은 조합입니다.";
}

if (selectedMeal === "연인과 함께") {
  foodRecommendation.reason += " 연인과 함께 볼 때도 분위기를 해치지 않는 음식입니다.";
}

if (selectedMeal === "간단한 식사") {
  foodRecommendation.reason += " 간단하게 먹고 싶을 때 부담 없이 선택하기 좋습니다.";
}

if (selectedMeal === "든든한 식사") {
  foodRecommendation.reason += " 든든하게 먹고 싶을 때 만족도가 높은 조합입니다.";
}


// ===============================
// 12. 뒤로가기 버튼
// ===============================

backToMainBtn.addEventListener("click", () => {
  window.location.href = "main.html";
});


// ===============================
// 13. 실행
// ===============================

async function initMoviePage() {
  selectedGenreTitle.textContent = `${selectedGenre} 영화`;
  await loadMoviesByGenre(selectedGenre);
}

initMoviePage();