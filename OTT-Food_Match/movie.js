// ===============================
// 1. 기본 설정 및 데이터 매핑
// ===============================

const ottNameMap = { netflix: "넷플릭스", disney: "디즈니+", tving: "티빙", wavve: "웨이브" };
const ottNameMapEn = { netflix: "Netflix", disney: "Disney+", tving: "TVING", wavve: "wavve" };
const ottNameMapZh = { netflix: "网飞", disney: "迪士尼+", tving: "TVING", wavve: "wavve" }; // 중국어 OTT 명칭

const ottProviderMap = { netflix: 8, disney: 337, wavve: 356, tving: 97 };
const genreIdMap = { "액션": 28, "코미디": 35, "드라마": 18, "로맨스": 10749, "스릴러": 53, "애니메이션": 16 };

const mealMapEn = { "혼밥": "Eating Alone", "야식": "Late Night Snack", "친구와 함께": "With Friends", "연인과 함께": "With Partner", "간단한 식사": "Light Meal", "든든한 식사": "Hearty Meal" };
const mealMapZh = { "혼밥": "一人食", "야식": "夜宵", "친구와 함께": "朋友聚会", "연인과 함께": "恋人约会", "간단한 식사": "简单便餐", "든든한 식사": "丰盛正餐" };

let selectedGenre = "전체";
let currentMovies = [];

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");
const selectedMeal = urlParams.get("meal") ? decodeURIComponent(urlParams.get("meal")) : "";

const moviePageTitle = document.getElementById("moviePageTitle");
const moviePageInfo = document.getElementById("moviePageInfo");
const genreTabs = document.querySelectorAll(".genre-tab");
const selectedGenreTitle = document.getElementById("selectedGenreTitle");
const loadingText = document.getElementById("loadingText");
const movieList = document.getElementById("movieList");
const backToMainBtn = document.getElementById("backToMainBtn");

if (!ottKey) {
  alert("OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.");
  window.location.href = "main.html";
}

function applyMovieLanguage() {
  const lang = localStorage.getItem("lang") || "ko";
  
  // i18n 모듈에 정의된 데이터 자동 수령
  if (typeof applyLanguage === "function") applyLanguage();

  let ottDisplay = ottNameMap[ottKey];
  let mealDisplay = selectedMeal;

  if (lang === "en") {
    ottDisplay = ottNameMapEn[ottKey] || "OTT";
    mealDisplay = mealMapEn[selectedMeal] || selectedMeal;
  } else if (lang === "zh") {
    ottDisplay = ottNameMapZh[ottKey] || "OTT";
    mealDisplay = mealMapZh[selectedMeal] || selectedMeal;
  }
  
  if (moviePageTitle) {
    moviePageTitle.textContent = lang === "ko" ? `${ottDisplay} 영화` : (lang === "en" ? `${ottDisplay} Movies` : `${ottDisplay} 电影`);
  }
  if (moviePageInfo) {
    if (lang === "ko") moviePageInfo.textContent = `식사 상황: ${mealDisplay} / 상단 장르 버튼을 선택하면 해당 장르의 영화만 표시됩니다.`;
    else if (lang === "en") moviePageInfo.textContent = `Meal Setting: ${mealDisplay} / Select a genre button above to filter movies.`;
    else moviePageInfo.textContent = `用餐场景: ${mealDisplay} / 点击上方类型按钮可筛选相应电影。`;
  }
  if (selectedGenreTitle) {
    const genreKey = getGenreKey(selectedGenre);
    selectedGenreTitle.textContent = lang === "ko" ? `${t("tab_" + genreKey)} 영화` : (lang === "en" ? `${t("tab_" + genreKey)} Movies` : `${t("tab_" + genreKey)} 电影`);
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

async function loadMoviesByGenre(genre) {
  if (loadingText) {
    loadingText.classList.remove("hidden");
    loadingText.textContent = t("loadingText");
  }
  movieList.innerHTML = "";
  currentMovies = await fetchMoviesFromTMDB(genre);
  renderMovies(currentMovies);
}

async function fetchMoviesFromTMDB(genre) {
  const apiKey = window.CONFIG?.TMDB_API_KEY;
  const baseUrl = window.CONFIG?.TMDB_BASE_URL || "https://api.themoviedb.org/3";
  if (!apiKey) return [];
  const providerId = ottProviderMap[ottKey];
  if (!providerId) return [];
  const genreId = genreIdMap[genre];

  let url = `${baseUrl}/discover/movie?api_key=${apiKey}&language=ko-KR&region=KR&watch_region=KR&with_watch_providers=${providerId}&with_watch_monetization_types=flatrate&sort_by=popularity.desc&include_adult=false&page=1`;
  if (genre !== "전체") url += `&with_genres=${genreId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((movie) => ({
      id: movie.id,
      title: movie.title || movie.name || "No Title",
      overview: movie.overview || "",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "",
      rating: movie.vote_average,
    }));
  } catch (error) {
    return [];
  }
}

function renderMovies(movies) {
  if (loadingText) loadingText.classList.add("hidden");

  if (!movies || movies.length === 0) {
    movieList.innerHTML = `
      <div class="result-card">
        <p><strong>${t("noMoviesTitle")}</strong></p>
        <p style="color:#666; margin-top:8px;">${t("noMoviesDesc")}</p>
      </div>`;
    return;
  }

  movieList.innerHTML = movies.slice(0, 12).map((movie, index) => {
    const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w300${movie.posterPath}` : "";
    const titleText = movie.title !== "No Title" ? movie.title : t("noTitle");
    const releaseText = movie.releaseDate ? movie.releaseDate : t("noReleaseInfo");
    const ratingText = movie.rating ? movie.rating.toFixed(1) : t("noRatingInfo");

    return `
      <div class="movie-card" data-index="${index}">
        <div class="movie-poster-area">
          ${posterUrl ? `<img src="${posterUrl}" alt="Poster" class="movie-poster">` : `<div class="no-poster">No Image</div>`}
        </div>
        <div class="movie-info">
          <strong>${titleText}</strong>
          <p>${t("releaseDate")}: ${releaseText}</p>
          <p>${t("rating")}: ${ratingText}</p>
        </div>
        <div class="movie-detail-panel hidden" id="movieDetailPanel-${index}"></div>
      </div>`;
  }).join("");

  document.querySelectorAll(".movie-card").forEach((card) => {
    card.querySelector(".movie-poster-area").addEventListener("click", () => {
      const idx = Number(card.dataset.index);
      closeAllDetailPanels();
      openMovieDetailPanel(movies[idx], idx);
    });
  });
}

function closeAllDetailPanels() {
  document.querySelectorAll(".movie-detail-panel").forEach((panel) => {
    panel.classList.add("hidden");
    panel.innerHTML = "";
  });
}

function openMovieDetailPanel(movie, index) {
  const panel = document.getElementById(`movieDetailPanel-${index}`);
  const foodRecommendation = recommendFood(selectedGenre);
  const lang = localStorage.getItem("lang") || "ko";
  const overviewText = movie.overview ? movie.overview : t("noOverview");

  panel.innerHTML = `
    <div class="selected-movie-box">
      <h3>${t("movieDescHeader")}</h3>
      <p><strong>${movie.title}</strong></p>
      <p>${overviewText}</p>
    </div>
    <div class="food-result-box">
      <h3>${t("foodRecHeader")}</h3>
      <p><strong>${foodRecommendation[lang].name}</strong></p>
      <p>${foodRecommendation[lang].reason}</p>
    </div>`;
  panel.classList.remove("hidden");
}

// 💡 중국어(zh) 메뉴 및 추천 사유 데이터 세트 확장 추가
function recommendFood(genre) {
  const foodRules = {
    "전체": {
      ko: { name: "치킨 + 콜라", reason: "OTT를 보면서 먹기 편하고 대부분의 영화와 무난하게 어울리는 조합입니다." },
      en: { name: "Chicken + Cola", reason: "Easy to eat while watching OTT and pairs well with most movies overall." },
      zh: { name: "炸鸡 + 可乐", reason: "边看视频边吃很方便，和绝大多数电影都很百搭。" }
    },
    "스릴러": {
      ko: { name: "피자 + 콜라", reason: "스릴러 영화는 긴장감이 강하기 때문에 화면에 집중하면서 간단히 집어 먹을 수 있는 피자가 잘 어울립니다." },
      en: { name: "Pizza + Cola", reason: "Since thriller movies are highly intense, pizza is perfect to grab easily while staying focused on the screen." },
      zh: { name: "披萨 + 可乐", reason: "惊悚片节奏紧张，最适合边盯着屏幕边随手拿着吃的披萨。" }
    },
    "코미디": {
      ko: { name: "떡볶이 + 튀김", reason: "코미디 영화의 가볍고 즐거운 분위기에는 부담 없이 먹기 좋은 분식 조합이 잘 어울립니다." },
      en: { name: "Tteokbokki + Fried Sides", reason: "The light and fun mood of comedy movies pairs perfectly with casual Korean street food." },
      zh: { name: "辣炒年糕 + 炸物", reason: "喜剧片轻松愉快的氛围，与无负担、易入口的韩式街头小吃是绝配。" }
    },
    "드라마": {
      ko: { name: "우동", reason: "드라마 영화의 잔잔한 감정선과 따뜻한 국물 음식이 잘 어울립니다." },
      en: { name: "Udon Noodles", reason: "The calm emotional storyline of drama movies pairs beautifully with warm, soothing noodle soup." },
      zh: { name: "乌冬面", reason: "剧情片细腻动人的情感路线，与温暖、治愈的汤面非常契合。" }
    },
    "로맨스": {
      ko: { name: "파스타 + 샐러드", reason: "로맨스 영화의 부드러운 분위기에는 깔끔하고 분위기 있는 음식이 잘 어울립니다." },
      en: { name: "Pasta + Salad", reason: "The sweet and gentle mood of romance movies matches well with elegant, clean dishes." },
      zh: { name: "意面 + 沙拉", reason: "爱情片浪漫温柔的氛围，适合搭配精致、有情调的料理。" }
    },
    "액션": {
      ko: { name: "치킨 + 감자튀김", reason: "액션 영화의 빠르고 강한 분위기에는 든든하고 자극적인 음식이 잘 어울립니다." },
      en: { name: "Chicken + French Fries", reason: "The fast and powerful vibe of action movies pairs great with satisfying and savory foods." },
      zh: { name: "炸鸡 + 炸薯条", reason: "动作片节奏快、冲击力强，最适合搭配管饱且重口味的高热量美食。" }
    },
    "애니메이션": {
      ko: { name: "햄버거 세트", reason: "애니메이션은 편하게 보기 좋은 경우가 많아서 간단하고 대중적인 햄버거 세트가 잘 어울립니다." },
      en: { name: "Burger Combo", reason: "Animations are usually easy to enjoy, making a simple and popular burger set an excellent choice." },
      zh: { name: "汉堡套餐", reason: "看动画片通常非常放松，搭配简单且大众化的汉堡套餐是个极佳的选择。" }
    }
  };
  return foodRules[genre] || foodRules["전체"];
}

if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => { window.location.href = "main.html"; });
}

// 🌐 i18n 모듈로부터 언어 변경 수신 시 전면 리렌더링
document.addEventListener("languageChanged", () => {
  applyMovieLanguage();
  renderMovies(currentMovies);
});

// 설정 팝업 제어
const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");
if (settingBtn && settingPopup) {
  settingBtn.addEventListener("click", (e) => { e.stopPropagation(); settingPopup.classList.toggle("hidden"); });
  document.addEventListener("click", () => { if (settingPopup) settingPopup.classList.add("hidden"); });
}

applyMovieLanguage();
loadMoviesByGenre(selectedGenre);

