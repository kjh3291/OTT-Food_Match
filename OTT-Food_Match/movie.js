import { showToast, initDarkMode, initSettingsPopup, getTmdbLang } from './common.js';

// ===============================
// 1. 기본 설정 및 데이터 매핑
// ===============================
const ottNameMap = { netflix: "넷플릭스", disney: "디즈니+", tving: "티빙", wavve: "웨이브" };
const ottNameMapEn = { netflix: "Netflix", disney: "Disney+", tving: "TVING", wavve: "wavve" };
const ottNameMapZh = { netflix: "网飞", disney: "迪士尼+", tving: "TVING", wavve: "wavve" };
const ottNameMapJa = { netflix: "Netflix", disney: "Disney+", tving: "TVING", wavve: "wavve" };

const ottProviderMap = { netflix: 8, disney: 337, wavve: 356, tving: 97 };
const genreIdMap = { "액션": 28, "코미디": 35, "드라마": 18, "로맨스": 10749, "스릴러": 53, "애니메이션": 16 };

const mealMapEn = { "혼밥": "Eating Alone", "야식": "Late Night Snack", "친구와 함께": "With Friends", "연인과 함께": "With Partner", "간단한 식사": "Light Meal", "든든한 식사": "Hearty Meal" };
const mealMapZh = { "혼밥": "一人食", "야식": "夜宵", "친구와 함께": "朋友聚会", "연인과 함께": "恋人约会", "간단한 식사": "简单便餐", "든든한 식사": "丰盛正餐" };
const mealMapJa = { "혼밥": "一人ご飯", "야식": "夜食", "친구와 함께": "友達と一緒に", "연인과 함께": "恋人と一緒に", "간단한 식사": "軽食", "든든한 식사": "がっつり食事" };

const urlParams = new URLSearchParams(window.location.search);

const ottKey = urlParams.get("ott");

let selectedMeal = urlParams.get("meal")
  ? decodeURIComponent(urlParams.get("meal"))
  : "혼밥";

let selectedGenre = urlParams.get("genre")
  ? decodeURIComponent(urlParams.get("genre"))
  : "전체";

const selectedFood = urlParams.get("food")
  ? decodeURIComponent(urlParams.get("food"))
  : "";

const selectedFoodCategory = urlParams.get("foodCategory")
  ? decodeURIComponent(urlParams.get("foodCategory"))
  : "AI 추천";

const selectedAiReason = urlParams.get("aiReason")
  ? decodeURIComponent(urlParams.get("aiReason"))
  : "";

let currentMovies = [];

let currentSort = "popularity";
let visibleMovieCount = 20;
const MOVIES_PER_LOAD = 20;

const moviePageTitle = document.getElementById("moviePageTitle");
const moviePageInfo = document.getElementById("moviePageInfo");
const genreTabs = document.querySelectorAll(".genre-tab");
const selectedGenreTitle = document.getElementById("selectedGenreTitle");
const loadingText = document.getElementById("loadingText");
const movieList = document.getElementById("movieList");
const backToMainBtn = document.getElementById("backToMainBtn");
const movieLoadingOverlay = document.getElementById("movieLoadingOverlay");

const sortMenuBtn = document.getElementById("sortMenuBtn");
const sortMenu = document.getElementById("sortMenu");
const sortOptions = document.querySelectorAll(".sort-option");
const loadMoreBtn = document.getElementById("loadMoreBtn");

function showMovieLoading() {
  if (movieLoadingOverlay) movieLoadingOverlay.classList.remove("hidden");
}

function hideMovieLoading() {
  if (movieLoadingOverlay) movieLoadingOverlay.classList.add("hidden");
}

if (!ottKey) {
  const lang = localStorage.getItem("lang") || "ko";
  let msg = "OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.";
  if (lang === "en") msg = "No OTT info found. Please select an OTT on the main screen.";
  else if (lang === "zh") msg = "未找到 OTT 信息，请在主页重新选择 OTT 平台。";
  else if (lang === "ja") msg = "OTT情報がありません。メイン画面でOTTを再度選択してください。";
  showToast(msg);
  setTimeout(() => { window.location.href = "index.html"; }, 2000);
}

function applyMovieLanguage() {
  const lang = localStorage.getItem("lang") || "ko";

  let ottDisplay = ottNameMap[ottKey];
  let mealDisplay = selectedMeal;

  if (lang === "en") {
    ottDisplay = ottNameMapEn[ottKey] || "OTT";
    mealDisplay = mealMapEn[selectedMeal] || selectedMeal;
  } else if (lang === "zh") {
    ottDisplay = ottNameMapZh[ottKey] || "OTT";
    mealDisplay = mealMapZh[selectedMeal] || selectedMeal;
  } else if (lang === "ja") {
    ottDisplay = ottNameMapJa[ottKey] || "OTT";
    mealDisplay = mealMapJa[selectedMeal] || selectedMeal;
  }

  if (moviePageTitle) {
    if (lang === "ko") moviePageTitle.textContent = `${ottDisplay} 영화`;
    else if (lang === "en") moviePageTitle.textContent = `${ottDisplay} Movies`;
    else if (lang === "zh") moviePageTitle.textContent = `${ottDisplay} 电影`;
    else if (lang === "ja") moviePageTitle.textContent = `${ottDisplay} 映画`;
  }

  if (moviePageInfo) {
  if (lang === "ko") {
    moviePageInfo.textContent = selectedFood
      ? `식사 상황: ${mealDisplay} / AI 추천 음식: ${selectedFood} / ${selectedGenre} 장르 영화만 표시됩니다.`
      : `식사 상황: ${mealDisplay} / 상단 장르 버튼을 선택하면 해당 장르의 영화만 표시됩니다.`;
  } else if (lang === "en") {
    moviePageInfo.textContent = selectedFood
      ? `Meal Setting: ${mealDisplay} / AI Food Pick: ${selectedFood} / Showing ${selectedGenre} movies.`
      : `Meal Setting: ${mealDisplay} / Select a genre button above to filter movies.`;
  } else if (lang === "zh") {
    moviePageInfo.textContent = selectedFood
      ? `用餐场景: ${mealDisplay} / AI 推荐美食: ${selectedFood} / 正在显示 ${selectedGenre} 类型电影。`
      : `用餐场景: ${mealDisplay} / 点击上方类型按钮可筛选相应电影。`;
  } else if (lang === "ja") {
    moviePageInfo.textContent = selectedFood
      ? `食事の状況: ${mealDisplay} / AIおすすめ料理: ${selectedFood} / ${selectedGenre}ジャンルの映画を表示しています。`
      : `食事の状況: ${mealDisplay} / 上のジャンルボタンを選択すると、該当する映画が表示されます。`;
  }
}

  if (selectedGenreTitle) {
    const genreKey = getGenreKey(selectedGenre);
    if (lang === "ko") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} 영화`;
    else if (lang === "en") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} Movies`;
    else if (lang === "zh") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} 电影`;
    else if (lang === "ja") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} 映画`;
  }
}

const sortTextMap = {
  popularity: { ko: "인기순", en: "Popularity", zh: "按人气", ja: "人気順" },
  rating: { ko: "평점순", en: "Rating", zh: "按评分", ja: "評価順" },
  latest: { ko: "최신순", en: "Latest", zh: "最新", ja: "最新順" },
  title: { ko: "이름순", en: "Title", zh: "按标题", ja: "名前順" }
};

function updateSortMenuText() {
  const lang = localStorage.getItem("lang") || "ko";

  const currentText = sortTextMap[currentSort][lang] || sortTextMap[currentSort]["ko"];
  if (sortMenuBtn) sortMenuBtn.textContent = currentText + " ▾";

  if (sortOptions.length >= 4) {
    sortOptions[0].textContent = sortTextMap["popularity"][lang] || "인기순";
    sortOptions[1].textContent = sortTextMap["rating"][lang] || "평점순";
    sortOptions[2].textContent = sortTextMap["latest"][lang] || "최신순";
    sortOptions[3].textContent = sortTextMap["title"][lang] || "이름순";
  }
}

function getGenreKey(genre) {
  const map = { "전체": "all", "액션": "action", "코미디": "comedy", "드라마": "drama", "로맨스": "romance", "스릴러": "thriller", "애니메이션": "animation" };
  return map[genre] || "all";
}

genreTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    selectedGenre = tab.dataset.genre.trim();
    genreTabs.forEach((btn) => btn.classList.remove("selected"));
    tab.classList.add("selected");
    applyMovieLanguage();
    await loadMoviesByGenre(selectedGenre);
  });
});

function applyInitialGenreTab() {
  genreTabs.forEach((tab) => {
    const tabGenre = (tab.dataset.genre || "").trim();
    const currentGenre = (selectedGenre || "전체").trim();

    if (tabGenre === currentGenre) {
      tab.classList.add("selected");
    } else {
      tab.classList.remove("selected");
    }
  });
}

async function loadMoviesByGenre(genre) {
  showMovieLoading();

  if (loadingText) {
    loadingText.classList.remove("hidden");
    loadingText.textContent = typeof t === "function" ? t("loadingText") : "영화 목록을 불러오는 중입니다...";
  }

  if (movieList) movieList.innerHTML = "";
  if (loadMoreBtn) loadMoreBtn.classList.add("hidden");

  visibleMovieCount = MOVIES_PER_LOAD;

  try {
    currentMovies = await fetchMoviesFromTMDB(genre);
    renderMovies(currentMovies);
  } catch (error) {
    console.error("영화 목록 로딩 실패:", error);
    if (loadingText) loadingText.classList.add("hidden");

    if (movieList) {
      movieList.innerHTML = `
        <div class="result-card">
          <p><strong>영화 목록을 불러오지 못했습니다.</strong></p>
          <p style="color:#666; margin-top:8px;">
            ${error.message || "잠시 후 다시 시도하거나 다른 장르를 선택해주세요."}
          </p>
        </div>
      `;
    }
  } finally {
    hideMovieLoading();
  }
}

async function fetchMoviesFromTMDB(genre) {
  const tmdbLang = getTmdbLang();
  const maxPagesToFetch = 3;
  const allResults = [];

  async function fetchMoviePage(page) {
    const url = `/api/movies?ott=${encodeURIComponent(ottKey)}&genre=${encodeURIComponent(genre)}&lang=${encodeURIComponent(tmdbLang)}&page=${page}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `영화 목록 API 오류: ${response.status}`);
    }
    return await response.json();
  }

  try {
    const firstData = await fetchMoviePage(1);

    if (!firstData.movies || !Array.isArray(firstData.movies)) {
      throw new Error("영화 목록 응답 형식이 올바르지 않습니다.");
    }

    allResults.push(...firstData.movies);
    const totalPages = Math.min(firstData.totalPages || 1, maxPagesToFetch);

    for (let page = 2; page <= totalPages; page++) {
      const data = await fetchMoviePage(page);
      if (data.movies && Array.isArray(data.movies)) {
        allResults.push(...data.movies);
      }
    }

    const uniqueMovies = removeDuplicateMovies(allResults);

    if (uniqueMovies.length === 0 && genre !== "전체") {
      console.warn(`${genre} 장르 결과가 없어 전체 영화로 다시 불러옵니다.`);
      return await fetchMoviesFromTMDB("전체");
    }

    return uniqueMovies;
  } catch (error) {
    console.error("영화 목록 요청 중 오류 발생:", error);
    throw error;
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
  } else if (currentSort === "rating") {
    sortedMovies.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === "latest") {
    sortedMovies.sort((a, b) => {
      const dateA = a.releaseDate || "0000-00-00";
      const dateB = b.releaseDate || "0000-00-00";
      return new Date(dateB) - new Date(dateA);
    });
  } else if (currentSort === "title") {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sortedMovies;
}

function renderMovies(movies) {
  if (loadingText) loadingText.classList.add("hidden");

  if (!movies || movies.length === 0) {
    movieList.innerHTML = `
      <div class="result-card">
        <p><strong>${typeof t === "function" ? t("noMoviesTitle") : "조건에 맞는 영화가 없습니다."}</strong></p>
        <p style="color:#666; margin-top:8px;">다른 장르를 선택해 보세요.</p>
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.classList.add("hidden");
    return;
  }

  const sortedMovies = sortMovies(movies);
  const visibleMovies = sortedMovies.slice(0, visibleMovieCount);

  movieList.innerHTML = visibleMovies.map((movie, index) => {
    const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w300${movie.posterPath}` : "";
    const titleText = movie.title !== "No Title" ? movie.title : (typeof t === "function" ? t("noTitle") : "제목 없음");
    const releaseText = movie.releaseDate ? movie.releaseDate : (typeof t === "function" ? t("noReleaseInfo") : "정보 없음");
    const ratingText = movie.rating ? movie.rating.toFixed(1) : (typeof t === "function" ? t("noRatingInfo") : "정보 없음");

    return `
      <div class="movie-card" data-index="${index}" style="cursor: pointer;">
        <div class="movie-poster-area">
          ${posterUrl ? `<img src="${posterUrl}" alt="Poster" class="movie-poster">` : `<div class="no-poster">No Image</div>`}
        </div>

        <div class="movie-info">
          <strong>${titleText}</strong>
          <p>${typeof t === "function" ? t("releaseDate") : "개봉일:"} ${releaseText}</p>
          <p>${typeof t === "function" ? t("rating") : "평점:"} ${ratingText}</p>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = Number(card.dataset.index);
      const selectedMovie = visibleMovies[idx];
      const mealParam = encodeURIComponent(selectedMeal);
      const genreParam = encodeURIComponent(selectedGenre);

      let recommendUrl =
  `recommend.html?movieId=${selectedMovie.id}` +
  `&ott=${ottKey}` +
  `&meal=${mealParam}` +
  `&genre=${genreParam}`;

if (selectedFood) {
  const foodParam = encodeURIComponent(selectedFood);
  const foodCategoryParam = encodeURIComponent(selectedFoodCategory || "AI 추천");

  const reasonText =
    selectedAiReason ||
    `${selectedMovie.title}의 분위기와 ${selectedMeal} 상황을 고려했을 때, ${selectedFood}와 잘 어울리는 조합입니다.`;

  recommendUrl +=
    `&mode=aiPick` +
    `&foodName=${foodParam}` +
    `&foodCategory=${foodCategoryParam}` +
    `&reason=${encodeURIComponent(reasonText)}`;
}

window.location.href = recommendUrl;
    });
  });

  if (loadMoreBtn) {
    const lang = localStorage.getItem("lang") || "ko";
    if (visibleMovieCount < sortedMovies.length) {
      loadMoreBtn.classList.remove("hidden");
      loadMoreBtn.disabled = false;
      const moreTxt = lang === "ko" ? "더보기" : (lang === "en" ? "Load More" : (lang === "zh" ? "加载更多" : "もっと見る"));
      loadMoreBtn.textContent = `${moreTxt} (${visibleMovies.length}/${sortedMovies.length})`;
    } else {
      loadMoreBtn.classList.remove("hidden");
      loadMoreBtn.disabled = true;
      const allTxt = lang === "ko" ? "모든 영화를 확인했습니다" : (lang === "en" ? "All movies loaded" : (lang === "zh" ? "已加载所有电影" : "すべての映画を確認しました"));
      loadMoreBtn.textContent = `${allTxt} (${sortedMovies.length})`;
    }
  }
}


if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => { window.location.href = "index.html"; });
}

document.addEventListener("languageChanged", () => {
  applyInitialGenreTab();
  applyMovieLanguage();
  updateSortMenuText();
  renderMovies(currentMovies);
});

initSettingsPopup();
initDarkMode();

if (sortMenuBtn && sortMenu) {
  sortMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    sortMenu.classList.toggle("hidden");
  });

  sortMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    sortMenu.classList.add("hidden");
  });
}

sortOptions.forEach((option) => {
  option.addEventListener("click", () => {
    currentSort = option.dataset.sort;
    updateSortMenuText();
    sortMenu.classList.add("hidden");
    visibleMovieCount = MOVIES_PER_LOAD;
    renderMovies(currentMovies);
  });
});

// 초기 실행
applyInitialGenreTab();
applyMovieLanguage();
updateSortMenuText();
loadMoviesByGenre(selectedGenre);
