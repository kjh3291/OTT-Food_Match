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

const mealData = convertFoods(meals, "식사");
const dessertData = convertFoods(desserts, "디저트");
const fastfoodData = convertFoods(fastfoods, "패스트푸드");

const allFoods = [...mealData, ...dessertData, ...fastfoodData];

let selectedGenre = "전체";
let currentMovies = [];

let currentSort = "popularity";
let visibleMovieCount = 20;
const MOVIES_PER_LOAD = 20;

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

const sortMenuBtn = document.getElementById("sortMenuBtn");
const sortMenu = document.getElementById("sortMenu");
const sortOptions = document.querySelectorAll(".sort-option");
const loadMoreBtn = document.getElementById("loadMoreBtn");


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

    if (!genre) {
      alert("장르 정보가 없습니다. movie.html의 data-genre 값을 확인해주세요.");
      return;
    }

    selectedGenre = genre.trim();

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

  if (loadMoreBtn) {
    loadMoreBtn.classList.add("hidden");
  }

  visibleMovieCount = MOVIES_PER_LOAD;

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

  if (genre !== "전체" && !genreId) {
    alert("지원하지 않는 장르입니다.");
    return [];
  }

  const maxPagesToFetch = 8;
  const allResults = [];

  function buildMovieUrl(page) {
    let url =
      `${baseUrl}/discover/movie` +
      `?api_key=${apiKey}` +
      `&language=ko-KR` +
      `&region=KR` +
      `&watch_region=KR` +
      `&with_watch_providers=${providerId}` +
      `&with_watch_monetization_types=flatrate` +
      `&sort_by=popularity.desc` +
      `&include_adult=false` +
      `&page=${page}`;

    if (genre !== "전체") {
      url += `&with_genres=${genreId}`;
    }

    return url;
  }

  try {
    // 1페이지 먼저 요청
    const firstResponse = await fetch(buildMovieUrl(1));

    if (!firstResponse.ok) {
      console.error("TMDB 첫 페이지 요청 실패:", firstResponse.status);
      alert("영화 목록을 불러오지 못했습니다.");
      return [];
    }

    const firstData = await firstResponse.json();

    console.log("TMDB 첫 페이지 결과:", firstData);

    const totalPages = Math.min(firstData.total_pages || 1, maxPagesToFetch);

    const firstMovies = firstData.results.map((movie) => ({
      id: movie.id,
      title: movie.title || movie.name || "제목 없음",
      overview: movie.overview || "줄거리 정보가 없습니다.",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "개봉일 정보 없음",
      rating: movie.vote_average || 0,
      popularity: movie.popularity || 0,
      genre: genre,
    }));

    allResults.push(...firstMovies);

    // 2페이지부터 totalPages까지 추가 요청
    for (let page = 2; page <= totalPages; page++) {
      const response = await fetch(buildMovieUrl(page));

      if (!response.ok) {
        console.error(`${page}페이지 요청 실패:`, response.status);
        continue;
      }

      const data = await response.json();

      const movies = data.results.map((movie) => ({
        id: movie.id,
        title: movie.title || movie.name || "제목 없음",
        overview: movie.overview || "줄거리 정보가 없습니다.",
        posterPath: movie.poster_path,
        releaseDate: movie.release_date || "개봉일 정보 없음",
        rating: movie.vote_average || 0,
        popularity: movie.popularity || 0,
        genre: genre,
      }));

      allResults.push(...movies);
    }

    console.log("최종 영화 개수:", allResults.length);
    console.log("중복 제거 후 영화 개수:", removeDuplicateMovies(allResults).length);

    return removeDuplicateMovies(allResults);
  } catch (error) {
    console.error("TMDB API 요청 중 오류 발생:", error);
    alert("API 요청 중 오류가 발생했습니다.");
    return [];
  }
}

function removeDuplicateMovies(movies) {
  const movieMap = new Map();

  movies.forEach((movie) => {
    if (!movieMap.has(movie.id)) {
      movieMap.set(movie.id, movie);
    }
  });

  return Array.from(movieMap.values());
}

function sortMovies(movies) {
  const sortedMovies = [...movies];

  if (currentSort === "popularity") {
    sortedMovies.sort((a, b) => b.popularity - a.popularity);
  }

  if (currentSort === "rating") {
    sortedMovies.sort((a, b) => b.rating - a.rating);
  }

  if (currentSort === "latest") {
    sortedMovies.sort((a, b) => {
      const dateA = a.releaseDate === "개봉일 정보 없음" ? "0000-00-00" : a.releaseDate;
      const dateB = b.releaseDate === "개봉일 정보 없음" ? "0000-00-00" : b.releaseDate;

      return new Date(dateB) - new Date(dateA);
    });
  }

  if (currentSort === "title") {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sortedMovies;
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

    if (loadMoreBtn) {
      loadMoreBtn.classList.add("hidden");
    }

    return;
  }

  const sortedMovies = sortMovies(movies);
  const visibleMovies = sortedMovies.slice(0, visibleMovieCount);

  movieList.innerHTML = visibleMovies
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
        </div>
      `;
    })
    .join("");

  const movieCards = document.querySelectorAll(".movie-card");

  movieCards.forEach((card) => {
    const posterArea = card.querySelector(".movie-poster-area");

    posterArea.addEventListener("click", () => {
      const selectedIndex = Number(card.dataset.index);
      const selectedMovie = visibleMovies[selectedIndex];

      const mealParam = encodeURIComponent(selectedMeal);
      const genreParam = encodeURIComponent(selectedMovie.genre || selectedGenre);

      window.location.href =
        `recommend.html?movieId=${selectedMovie.id}` +
        `&ott=${ottKey}` +
        `&meal=${mealParam}` +
        `&genre=${genreParam}`;
    });
  });

  if (loadMoreBtn) {
  if (visibleMovieCount < sortedMovies.length) {
    loadMoreBtn.classList.remove("hidden");
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = `더보기 (${visibleMovies.length}/${sortedMovies.length})`;
  } else {
    loadMoreBtn.classList.remove("hidden");
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = `모든 영화를 확인했습니다 (${sortedMovies.length}개)`;
  }
}
}

// ===============================
// 12. 뒤로가기 버튼
// ===============================

if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => {
    window.location.href = "main.html";
  });
}


if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    visibleMovieCount += MOVIES_PER_LOAD;
    renderMovies(currentMovies);
  });
}

if (sortMenuBtn && sortMenu) {
  sortMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    sortMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    sortMenu.classList.add("hidden");
  });

  sortMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

sortOptions.forEach((option) => {
  option.addEventListener("click", () => {
    currentSort = option.dataset.sort;

    if (currentSort === "popularity") {
      sortMenuBtn.textContent = "인기순 ▾";
    }

    if (currentSort === "rating") {
      sortMenuBtn.textContent = "평점순 ▾";
    }

    if (currentSort === "latest") {
      sortMenuBtn.textContent = "최신순 ▾";
    }

    if (currentSort === "title") {
      sortMenuBtn.textContent = "이름순 ▾";
    }

    sortMenu.classList.add("hidden");

    visibleMovieCount = MOVIES_PER_LOAD;
    renderMovies(currentMovies);
  });
});


// ===============================
// 13. 실행
// ===============================

async function initMoviePage() {
  selectedGenreTitle.textContent = `${selectedGenre} 영화`;
  await loadMoviesByGenre(selectedGenre);
}

initMoviePage();

// ===============================
// 14. 설정 팝업 + 다크 모드
// ===============================

const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

// 설정 버튼을 누르면 작은 설정 팝업을 열고 닫는다.
if (settingBtn && settingPopup) {
  settingBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    settingPopup.classList.toggle("hidden");
  });

  settingPopup.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    settingPopup.classList.add("hidden");
  });
}

// 기존에 저장된 다크 모드 설정이 있으면 영화 페이지에도 그대로 적용한다.
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");

  if (darkModeToggle) {
    darkModeToggle.textContent = "☀️ 라이트 모드";
  }
}

// 다크 모드 버튼을 누르면 body에 dark-mode 클래스를 추가하거나 제거한다.
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      darkModeToggle.textContent = "☀️ 라이트 모드";
    } else {
      localStorage.setItem("theme", "light");
      darkModeToggle.textContent = "🌙 다크 모드";
    }
  });
}