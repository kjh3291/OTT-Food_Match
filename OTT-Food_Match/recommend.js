import { foodCategories } from './food.js';

// ===============================
// 1. URL 값 가져오기
// ===============================
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movieId");
const ottKey = urlParams.get("ott");

const selectedMeal = urlParams.get("meal") ? decodeURIComponent(urlParams.get("meal")) : "";
const selectedGenre = urlParams.get("genre") ? decodeURIComponent(urlParams.get("genre")) : "전체";

const pageMode = urlParams.get("mode") || "recommend";
const savedFoodName = urlParams.get("foodName") ? decodeURIComponent(urlParams.get("foodName")) : "";
const savedFoodCategory = urlParams.get("foodCategory") ? decodeURIComponent(urlParams.get("foodCategory")) : "기타";
const savedReason = urlParams.get("reason") ? decodeURIComponent(urlParams.get("reason")) : "";

// 지도에서 넘어온 경우
const mapPickPlaceName = urlParams.get("placeName") ? decodeURIComponent(urlParams.get("placeName")) : null;
const mapPickPlaceCategory = urlParams.get("placeCategory") ? decodeURIComponent(urlParams.get("placeCategory")) : null;

// ===============================
// 2. 음식 데이터 준비 (기존 7개 카테고리용)
// ===============================
const meals = [
  ...(foodCategories["한식"] || []),
  ...(foodCategories["중식"] || []),
  ...(foodCategories["일식"] || []),
  ...(foodCategories["양식"] || [])
];

const desserts = [
  ...(foodCategories["디저트"] || [])
];

const fastfoods = [
  ...(foodCategories["치킨"] || []),
  ...(foodCategories["패스트푸드"] || [])
];

function convertFoods(foodArray, category) {
  return foodArray.map((food) => ({
    name: food,
    category: category
  }));
}

const mealData = convertFoods(meals, "식사");
const dessertData = convertFoods(desserts, "디저트");
const fastfoodData = convertFoods(fastfoods, "패스트푸드");

const allFoods = [...mealData, ...dessertData, ...fastfoodData];

// ===============================
// 3. HTML 요소 가져오기
// ===============================
const recommendPageTitle = document.getElementById("recommendPageTitle");
const recommendPageInfo = document.getElementById("recommendPageInfo");
const recommendDetailArea = document.getElementById("recommendDetailArea");

const recommendLoadingOverlay = document.getElementById("recommendLoadingOverlay");
const recommendLoadingTitle = document.getElementById("recommendLoadingTitle");
const recommendLoadingDesc = document.getElementById("recommendLoadingDesc");

function showRecommendOverlayLoading(title = "추천 정보를 불러오는 중입니다", desc = "잠시만 기다려주세요.") {
  if (recommendLoadingTitle) recommendLoadingTitle.textContent = title;
  if (recommendLoadingDesc) recommendLoadingDesc.textContent = desc;
  if (recommendLoadingOverlay) recommendLoadingOverlay.classList.remove("hidden");
}

function hideRecommendOverlayLoading() {
  if (recommendLoadingOverlay) recommendLoadingOverlay.classList.add("hidden");
}

function showRecommendLoading(message = "추천 정보를 불러오는 중입니다...") {
  showRecommendOverlayLoading(message, "잠시만 기다려주세요.");
  if (recommendDetailArea) {
    recommendDetailArea.innerHTML = `
      <div class="saved-empty-card recommend-loading-card">
        <div class="saved-empty-icon">🤖</div>
        <h3>${message}</h3>
        <p>잠시만 기다려주세요.</p>
      </div>
    `;
  }
}

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const saveComboBtn = document.getElementById("saveComboBtn");
const backToMovieBtn = document.getElementById("backToMovieBtn");
const backToMainBtn = document.getElementById("backToMainBtn");

const reactionCard = likeBtn?.closest(".card") || document.querySelector(".reaction-area")?.closest(".card");

function hideReactionCard() { if (reactionCard) reactionCard.style.display = "none"; }
function showReactionCard() { if (reactionCard && pageMode !== "saved") reactionCard.style.display = ""; }
function hideBackToMovieButton() { if (backToMovieBtn) backToMovieBtn.style.display = "none"; }
function showBackToMovieButton() { if (backToMovieBtn && pageMode !== "saved") backToMovieBtn.style.display = ""; }

// ===============================
// 4. 현재 선택된 정보 저장
// ===============================
let currentMovie = null;
let currentFood = null;
let currentReason = "";

// ===============================
// 5. 영화 상세 정보 가져오기
// ===============================
async function fetchMovieDetail() {
  if (!movieId) {
    alert("영화 정보가 없습니다. 영화 목록에서 다시 선택해주세요.");
    window.location.href = "index.html";
    return null;
  }

  const lang = localStorage.getItem("lang") || "ko";
  const tmdbLangMap = { ko: "ko-KR", en: "en-US", zh: "zh-CN", ja: "ja-JP" };
  const tmdbLang = tmdbLangMap[lang] || "ko-KR";

  const url = `/api/movie-detail?movieId=${encodeURIComponent(movieId)}&lang=${encodeURIComponent(tmdbLang)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("영화 상세 API 오류:", response.status, errorData);
      alert(errorData?.message || "영화 상세 정보를 불러오지 못했습니다.");
      return null;
    }
    const data = await response.json();
    if (!data.movie) {
      alert("영화 상세 응답 형식이 올바르지 않습니다.");
      return null;
    }
    return data.movie;
  } catch (error) {
    console.error("영화 상세 API 요청 중 오류:", error);
    alert("API 요청 중 오류가 발생했습니다.");
    return null;
  }
}

// ===============================
// 6. 장르 → 음식 카테고리 변환
// ===============================
function getCategoriesFromGenre(genre) {
  switch (genre) {
    case "액션": return ["패스트푸드", "식사"];
    case "코미디": return ["식사"];
    case "드라마": return ["디저트"];
    case "로맨스": return ["디저트"];
    case "스릴러": return ["패스트푸드"];
    case "애니메이션": return ["패스트푸드", "디저트"];
    default: return ["식사", "패스트푸드", "디저트"];
  }
}

function getFoodsByCategories(categories) {
  return allFoods.filter((food) => categories.includes(food.category));
}

// ===============================
// 7. 추천 사유 만들기
// ===============================
function makeRecommendReason(movie, food) {
  const lang = typeof getLang === 'function' ? getLang() : "ko";

  if (lang === "en") return `The mood of ${selectedGenre} movies matches perfectly with ${food.name}. Highly recommended for your current setting (${selectedMeal}).`;
  if (lang === "zh") return `${selectedGenre} 电影的氛围非常适合搭配 ${food.name}。这与您的当前场景（${selectedMeal}）完美契合。`;
  if (lang === "ja") return `${selectedGenre} 映画の雰囲気は ${food.name} とよく合います。現在の状況（${selectedMeal}）にぴったりの組み合わせです。`;

  let reason = "";

  if (selectedGenre === "액션") {
    reason += "액션 영화는 빠른 전개와 강한 몰입감이 특징입니다. ";
    reason += `${food.name}은(는) 영화에 집중하면서 먹기 좋고, 자극적인 분위기와 잘 어울립니다. `;
  } else if (selectedGenre === "코미디") {
    reason += "코미디 영화는 가볍고 즐거운 분위기가 중요합니다. ";
    reason += `${food.name}은(는) 부담 없이 먹기 좋아서 편안한 감상 분위기를 만들어줍니다. `;
  } else if (selectedGenre === "드라마") {
    reason += "드라마 영화는 감정선과 몰입감이 중요한 장르입니다. ";
    reason += `${food.name}은(는) 차분한 분위기에서 영화를 보기 좋게 만들어줍니다. `;
  } else if (selectedGenre === "로맨스") {
    reason += "로맨스 영화는 부드럽고 감성적인 분위기가 중요합니다. ";
    reason += `${food.name}은(는) 분위기를 해치지 않고 깔끔하게 즐기기 좋습니다. `;
  } else if (selectedGenre === "스릴러") {
    reason += "스릴러 영화는 긴장감이 강하고 화면 집중도가 높은 장르입니다. ";
    reason += `${food.name}은(는) 간단히 먹을 수 있어 영화 흐름을 방해하지 않습니다. `;
  } else if (selectedGenre === "애니메이션") {
    reason += "애니메이션은 편하게 즐기기 좋은 경우가 많습니다. ";
    reason += `${food.name}은(는) 가볍게 먹기 좋아서 캐주얼한 감상에 잘 어울립니다. `;
  } else {
    reason += "전체 장르에서는 부담 없이 즐길 수 있는 음식 조합이 좋습니다. ";
    reason += `${food.name}은(는) 다양한 영화와 무난하게 어울리는 메뉴입니다. `;
  }

  if (selectedMeal === "혼밥") reason += "또한 혼밥 상황에서는 혼자 먹기 편하고 준비 부담이 적은 음식이 적합합니다.";
  else if (selectedMeal === "야식") reason += "또한 야식 상황에서는 너무 복잡하지 않고 편하게 먹을 수 있는 음식이 잘 맞습니다.";
  else if (selectedMeal === "친구와 함께") reason += "또한 친구와 함께 볼 때는 나눠 먹기 좋은 음식일수록 만족도가 높아집니다.";
  else if (selectedMeal === "연인과 함께") reason += "또한 연인과 함께라면 분위기를 해치지 않고 깔끔하게 먹을 수 있는 조합이 좋습니다.";
  else if (selectedMeal === "간단한 식사") reason += "또한 간단한 식사 상황이기 때문에 부담 없이 먹을 수 있는 메뉴가 잘 어울립니다.";
  else if (selectedMeal === "든든한 식사") reason += "또한 든든한 식사가 필요한 상황이므로 포만감 있는 메뉴가 더 잘 어울립니다.";

  return reason;
}

// ===============================
// 8. 추천 음식 생성 (자체 내장)
// ===============================
function makeFoodRecommendation(movie) {
  const categories = getCategoriesFromGenre(selectedGenre);
  const filteredFoods = getFoodsByCategories(categories);

  // 에러 방지용 기본 음식 (배열이 비어있을 경우 대비)
  if (!filteredFoods || filteredFoods.length === 0) {
    return { food: { name: "치킨", category: "패스트푸드" }, reason: "데이터를 불러오는 중 문제가 발생해 만인의 소울푸드인 치킨을 추천합니다." };
  }

  // 💡 무작위 추출 알고리즘을 이 안으로 안전하게 합쳤습니다.
  const food = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];

  return {
    food,
    reason: makeRecommendReason(movie, food),
  };
}

// ===============================
// 9. 언어별 헬퍼 함수
// ===============================
function getTranslatedMeal(meal) {
  const mealKeyMap = { "혼밥": "meal_honbab", "야식": "meal_yasik", "친구와 함께": "meal_friends", "연인과 함께": "meal_couple", "간단한 식사": "meal_light", "든든한 식사": "meal_heavy" };
  const key = mealKeyMap[meal];
  return key && typeof t === 'function' ? t(key) : meal;
}

function getTranslatedGenre(genre) {
  const genreKeyMap = { "전체": "tab_all", "액션": "tab_action", "코미디": "tab_comedy", "드라마": "tab_drama", "로맨스": "tab_romance", "스릴러": "tab_thriller", "애니메이션": "tab_animation" };
  const key = genreKeyMap[genre];
  return key && typeof t === 'function' ? t(key) : genre;
}

function safeText(key, fallback) {
  if (typeof t !== "function") return fallback;
  const translated = t(key);
  if (!translated || translated === key) return fallback;
  return translated;
}

// ===============================
// 10. 화면 출력 (다국어 + 지도 연동)
// ===============================
function renderRecommendDetail(movie, food, reason) {
  const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "";
  recommendPageTitle.textContent = movie.title;

  if (recommendPageInfo) {
    recommendPageInfo.textContent = `식사 상황: ${selectedMeal} / 영화 장르: ${selectedGenre}`;
  }

  let mapPickHtml = "";
  if (pageMode === "mapPick" && mapPickPlaceName) {
    mapPickHtml = `
      <div class="map-pick-info" style="margin-bottom: 25px; padding: 20px; border: 2px solid #6c5ce7; border-radius: 16px; background: rgba(108, 92, 231, 0.15);">
        <h3 style="margin: 0 0 10px 0; color: #a29bfe;">📍 선택한 식당 정보</h3>
        <p style="margin: 5px 0; font-size: 1.1rem;"><strong>식당 이름:</strong> ${mapPickPlaceName}</p>
        <p style="margin: 5px 0; color: #ccc;"><strong>업종:</strong> ${mapPickPlaceCategory}</p>
      </div>
    `;
  }

  recommendDetailArea.innerHTML = `
    <div class="recommend-layout">
      ${mapPickHtml}
      <div class="recommend-poster-box">
        ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="recommend-poster">` : `<div class="no-poster">${safeText("noPoster", "포스터 없음")}</div>`}
      </div>

      <div class="recommend-content-box">
        <h2>${movie.title}</h2>
        <p><strong>${safeText("recDate", "개봉일:")}</strong> ${movie.releaseDate || safeText("infoNone", "정보 없음")}</p>
        <p><strong>${safeText("recRating", "평점:")}</strong> ${movie.rating ? movie.rating.toFixed(1) : safeText("infoNone", "정보 없음")}</p>
        <p><strong>${safeText("recRuntime", "상영 시간:")}</strong> ${movie.runtime ? movie.runtime + safeText("mins", "분") : safeText("infoNone", "정보 없음")}</p>
        <p><strong>${safeText("recGenreLabel", "영화 장르:")}</strong> ${movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : getTranslatedGenre(selectedGenre)}</p>

        <hr class="recommend-divider">
        <h3>${safeText("recMovieDesc", "🎬 영화 설명")}</h3>
        <p>${movie.overview || safeText("noOverview", "줄거리 정보가 없습니다.")}</p>

        <hr class="recommend-divider">
        <h3>${safeText("recFoodRec", "🍽 추천 음식")}</h3>
        <p><strong>${food.name}</strong></p>

        <h3>${safeText("recReason", "💡 추천 사유")}</h3>
        <p>${reason}</p>
      </div>
    </div>
  `;

  hideRecommendOverlayLoading();
}

// ===============================
// 11. 좋아요 / 싫어요 저장
// ===============================
function saveReaction(reactionType) {
  if (!currentMovie || !currentFood) return;

  const reaction = {
    movieId: currentMovie.id,
    movieTitle: currentMovie.title,
    ott: ottKey,
    meal: selectedMeal,
    genre: selectedGenre,
    foodName: currentFood.name,
    foodCategory: currentFood.category,
    reason: currentReason,
    reaction: reactionType,
    createdAt: new Date().toISOString(),
  };

  const reactions = JSON.parse(localStorage.getItem("recommendReactions")) || [];
  const existingIndex = reactions.findIndex(item => item.movieId === reaction.movieId && item.foodName === reaction.foodName);

  if (existingIndex >= 0) reactions[existingIndex] = reaction;
  else reactions.push(reaction);

  localStorage.setItem("recommendReactions", JSON.stringify(reactions));

  if (reactionType === "like") alert(typeof t === 'function' ? t('alert_like') : "좋아요가 반영되었습니다.");
  else alert(typeof t === 'function' ? t('alert_dislike') : "싫어요가 반영되었습니다.");
}

// ===============================
// 12. 조합 저장
// ===============================
function saveCombo() {
  if (!currentMovie || !currentFood) return;

  const combo = {
    movieId: currentMovie.id,
    movieTitle: currentMovie.title,
    posterPath: currentMovie.posterPath,
    ott: ottKey,
    meal: selectedMeal,
    genre: selectedGenre,
    foodName: currentFood.name,
    foodCategory: currentFood.category,
    reason: currentReason,
    savedAt: new Date().toISOString(),
  };

  const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
  const isAlreadySaved = savedCombos.some(item => item.movieId === combo.movieId && item.foodName === combo.foodName);

  if (isAlreadySaved) {
    alert(typeof t === 'function' ? t('alert_already_saved') : "이미 저장된 조합입니다.");
    window.location.href = "index.html";
    return;
  }

  savedCombos.push(combo);
  localStorage.setItem("savedCombos", JSON.stringify(savedCombos));

  alert(typeof t === 'function' ? t('alert_saved') : "조합이 저장되었습니다.");
  window.location.href = "index.html";
}

// ===============================
// 13. 버튼 이벤트
// ===============================
if (likeBtn) likeBtn.addEventListener("click", () => saveReaction("like"));
if (dislikeBtn) dislikeBtn.addEventListener("click", () => saveReaction("dislike"));
if (saveComboBtn) saveComboBtn.addEventListener("click", () => saveCombo());

if (backToMovieBtn) {
  backToMovieBtn.addEventListener("click", () => {
    const mealParam = encodeURIComponent(selectedMeal);
    window.location.href = `movie.html?ott=${ottKey}&meal=${mealParam}`;
  });
}

if (backToMainBtn) backToMainBtn.addEventListener("click", () => { window.location.href = "index.html"; });

document.addEventListener("languageChanged", () => {
  if (currentMovie && currentFood) {
    currentReason = makeRecommendReason(currentMovie, currentFood);
    renderRecommendDetail(currentMovie, currentFood, currentReason);
  }
});

// ===============================
// 14. 설정 팝업 + 다크 모드
// ===============================
const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");
const darkModeToggle = document.getElementById("darkModeToggle");

if (settingBtn && settingPopup) {
  settingBtn.addEventListener("click", (event) => { event.stopPropagation(); settingPopup.classList.toggle("hidden"); });
  settingPopup.addEventListener("click", (event) => { event.stopPropagation(); });
  document.addEventListener("click", () => { settingPopup.classList.add("hidden"); });
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  if (darkModeToggle) darkModeToggle.textContent = typeof getLang === 'function' && getLang() === "ko" ? "☀️ 라이트 모드" : (typeof getLang === 'function' && getLang() === "en" ? "☀️ Light Mode" : (typeof getLang === 'function' && getLang() === "zh" ? "☀️ 浅色模式" : "☀️ ライトモード"));
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    document.dispatchEvent(new Event("languageChanged"));
  });
}

// ===============================
// 15. 실행 (초기화)
// ===============================
async function initRecommendPage() {
  if (pageMode === "saved") showRecommendLoading("저장된 조합을 불러오는 중입니다...");
  else showRecommendLoading("추천 정보를 불러오는 중입니다...");

  const movie = await fetchMovieDetail();

  if (!movie) {
    hideRecommendOverlayLoading();
    if (recommendDetailArea) {
      recommendDetailArea.innerHTML = `
        <div class="saved-empty-card">
          <div class="saved-empty-icon">⚠️</div>
          <h3>${typeof t === "function" ? t("errorLoadMovie") : "영화 정보를 불러오지 못했습니다."}</h3>
          <p>영화 목록에서 다시 선택해주세요.</p>
        </div>
      `;
    }
    return;
  }

  currentMovie = movie;

  if (pageMode === "mapPick") {
    currentFood = { name: mapPickPlaceName || "추천 음식", category: mapPickPlaceCategory || "기타" };
    currentReason = `지도에서 직접 선택하신 식당입니다. 이 장소에서 ${movie.title} 영화를 즐겨보세요!`;
    renderRecommendDetail(currentMovie, currentFood, currentReason);
  } else if (pageMode === "saved" && savedFoodName) {
    hideReactionCard();
    hideBackToMovieButton();
    currentFood = { name: savedFoodName, category: savedFoodCategory || "기타" };
    currentReason = savedReason || "저장된 추천 사유가 없습니다.";
    renderRecommendDetail(currentMovie, currentFood, currentReason);
  } else {
    showReactionCard();
    showBackToMovieButton();
    const recommendation = makeFoodRecommendation(movie);
    currentFood = recommendation.food;
    currentReason = recommendation.reason;
    renderRecommendDetail(currentMovie, currentFood, currentReason);
  }
}

initRecommendPage();