import { foodCategories } from './food.js';

// ===============================
// 1. URL 값 가져오기 (디코딩 에러 방지)
// ===============================
const urlParams = new URLSearchParams(window.location.search);
let movieId = urlParams.get("movieId");
const ottKey = urlParams.get("ott") || "netflix";

let selectedMeal = urlParams.get("meal") || "혼밥";
let selectedGenre = urlParams.get("genre") || "전체";

const pageMode = urlParams.get("mode") || "recommend";
const savedFoodName = urlParams.get("foodName") || "";
const savedFoodCategory = urlParams.get("foodCategory") || "기타";
const savedReason = urlParams.get("reason") || "";

// 지도에서 넘어온 경우
const mapPickPlaceName = urlParams.get("placeName") || null;
const mapPickPlaceCategory = urlParams.get("placeCategory") || null;

// ===============================
// 2. 음식 데이터 준비 (구버전, 신버전 food.js 모두 호환되도록 병합)
// ===============================
const meals = [
  ...(foodCategories["한식"] || []), ...(foodCategories["한식(찌개/탕)"] || []), ...(foodCategories["한식(볶음/구이)"] || []),
  ...(foodCategories["중식"] || []), ...(foodCategories["마라(마라탕/샹궈)"] || []),
  ...(foodCategories["일식"] || []), ...(foodCategories["일식(면/덮밥)"] || []), ...(foodCategories["일식(돈까스/초밥)"] || []),
  ...(foodCategories["양식"] || []), ...(foodCategories["아시안/퓨전"] || []), ...(foodCategories["분식"] || [])
];
const desserts = [
  ...(foodCategories["디저트"] || []), ...(foodCategories["디저트/카페"] || [])
];
const fastfoods = [
  ...(foodCategories["치킨"] || []), ...(foodCategories["패스트푸드"] || []), ...(foodCategories["야식"] || [])
];

function convertFoods(foodArray, category) {
  return foodArray.map((food) => ({ name: food, category: category }));
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
// 5. 영화 가져오기 로직 (상세정보 & 식당 기반 랜덤 영화)
// ===============================
async function fetchMovieDetailById(id) {
  const lang = localStorage.getItem("lang") || "ko";
  const tmdbLangMap = { ko: "ko-KR", en: "en-US", zh: "zh-CN", ja: "ja-JP" };
  const tmdbLang = tmdbLangMap[lang] || "ko-KR";
  const url = `/api/movie-detail?movieId=${encodeURIComponent(id)}&lang=${encodeURIComponent(tmdbLang)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.movie || null;
  } catch (error) {
    console.error("영화 상세 API 에러:", error);
    return null;
  }
}

// 💡 식당 카테고리를 분석해서 영화 장르를 결정합니다!
function getGenreFromFoodCategory(category) {
  if (!category) return "전체";
  const cat = category.toLowerCase();
  if (cat.includes("디저트") || cat.includes("카페") || cat.includes("커피")) return "로맨스";
  if (cat.includes("치킨") || cat.includes("패스트푸드") || cat.includes("야식") || cat.includes("고기") || cat.includes("마라")) return "액션";
  if (cat.includes("분식") || cat.includes("중식")) return "코미디";
  if (cat.includes("한식") || cat.includes("일식") || cat.includes("양식") || cat.includes("초밥")) return "드라마";
  return "전체";
}

// 💡 결정된 장르의 영화를 API에서 불러와 랜덤으로 하나 뽑습니다!
async function fetchRandomMovie(genre) {
  const lang = localStorage.getItem("lang") || "ko";
  const tmdbLangMap = { ko: "ko-KR", en: "en-US", zh: "zh-CN", ja: "ja-JP" };
  const tmdbLang = tmdbLangMap[lang] || "ko-KR";

  try {
    const listUrl = `/api/movies?ott=${encodeURIComponent(ottKey)}&genre=${encodeURIComponent(genre)}&lang=${encodeURIComponent(tmdbLang)}&page=1`;
    const response = await fetch(listUrl);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.movies || data.movies.length === 0) {
      if (genre !== "전체") return await fetchRandomMovie("전체"); // 없으면 '전체'에서 재시도
      return null;
    }

    const randomMovie = data.movies[Math.floor(Math.random() * data.movies.length)];
    movieId = randomMovie.id;
    selectedGenre = genre;
    return await fetchMovieDetailById(randomMovie.id);
  } catch (error) {
    console.error("랜덤 영화 추출 에러:", error);
    return null;
  }
}

// ===============================
// 6. 장르 → 음식 카테고리 (일반 추천용)
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
// 7. 일반 추천 사유 만들기
// ===============================
function makeRecommendReason(movie, food) {
  const lang = typeof getLang === 'function' ? getLang() : "ko";
  if (lang === "en") return `Highly recommended for your setting (${selectedMeal}).`;

  let reason = `${food.name}은(는) 영화 분위기와 잘 어울립니다. `;
  if (selectedGenre === "액션") reason = "액션 영화의 빠른 전개와 자극적인 분위기에 잘 어울립니다. ";
  else if (selectedGenre === "코미디") reason = "코미디 영화의 가벼운 분위기 속에서 편하게 먹기 좋습니다. ";
  else if (selectedGenre === "드라마") reason = "드라마 영화의 차분한 감정선과 아주 잘 어울립니다. ";
  else if (selectedGenre === "로맨스") reason = "로맨스 영화의 감성적인 분위기를 돋워줍니다. ";
  else if (selectedGenre === "스릴러") reason = "영화 흐름을 방해하지 않고 집중하며 먹기 좋습니다. ";

  if (selectedMeal === "혼밥") reason += "특히 혼자서 부담 없이 드시기 딱 좋은 메뉴입니다!";
  else if (selectedMeal === "야식") reason += "야식으로도 부담스럽지 않게 즐기기 좋은 메뉴입니다!";
  else if (selectedMeal === "친구와 함께") reason += "친구들과 함께 나눠 먹으며 보기 최고의 조합이죠!";

  return reason;
}

function makeFoodRecommendation(movie) {
  const categories = getCategoriesFromGenre(selectedGenre);
  const filteredFoods = getFoodsByCategories(categories);
  if (!filteredFoods || filteredFoods.length === 0) {
    return { food: { name: "치킨", category: "패스트푸드" }, reason: "만인의 소울푸드인 치킨을 추천합니다." };
  }
  const food = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
  return { food, reason: makeRecommendReason(movie, food) };
}

// ===============================
// 8. 헬퍼 함수
// ===============================
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
// 9. 화면 출력 (다국어 + 지도 연동)
// ===============================
// recommend.js 내의 renderRecommendDetail 함수 수정
function renderRecommendDetail(movie, food, reason) {
  const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "";
  recommendPageTitle.textContent = movie.title;

  if (recommendPageInfo) {
    recommendPageInfo.textContent = `식사 상황: ${selectedMeal} / 영화 장르: ${selectedGenre}`;
  }

  // 지도로 넘어갈 주소 조립 (추천받은 음식의 카테고리를 파라미터로 주입)
  const mapUrl = `map.html?ott=${encodeURIComponent(ottKey)}&meal=${encodeURIComponent(selectedMeal)}&movieId=${encodeURIComponent(movieId)}&foodCategory=${encodeURIComponent(food.category)}`;

  let mapPickHtml = "";
  if (pageMode === "mapPick" && mapPickPlaceName) {
    mapPickHtml = `
      <div class="map-pick-info" style="margin-bottom: 25px; padding: 20px; border: 2px solid #ff715b; border-radius: 16px; background: rgba(255, 113, 91, 0.15);">
        <h3 style="margin: 0 0 10px 0; color: #ff715b;">📍 선택하신 식당</h3>
        <p style="margin: 5px 0; font-size: 1.1rem;"><strong>식당 이름:</strong> ${mapPickPlaceName}</p>
        <p style="margin: 5px 0; color: #ccc;"><strong>업종:</strong> ${mapPickPlaceCategory}</p>
      </div>
    `;
  }

  // 포스터 박스 밑에 [🗺 내 주변 식당 찾아보기] 버튼 배치
  recommendDetailArea.innerHTML = `
    <div class="recommend-layout">
      <div class="recommend-poster-box">
        ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="recommend-poster">` : `<div class="no-poster">${safeText("noPoster", "포스터 없음")}</div>`}
        
        <button onclick="window.location.href='${mapUrl}'" style="
          width: 100%;
          margin-top: 15px;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: white;
          font-weight: bold;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
          transition: 0.3s;
        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          🗺 내 주변 식당 찾아보기
        </button>
      </div>

      <div class="recommend-content-box">
        ${mapPickHtml}
        <h2>${movie.title}</h2>
        <p><strong>${safeText("recDate", "개봉일:")}</strong> ${movie.releaseDate || safeText("infoNone", "정보 없음")}</p>
        <p><strong>${safeText("recRating", "평점:")}</strong> ${movie.rating ? movie.rating.toFixed(1) : safeText("infoNone", "정보 없음")}</p>
        <p><strong>${safeText("recRuntime", "상영 시간:")}</strong> ${movie.runtime ? movie.runtime + safeText("mins", "분") : safeText("infoNone", "정보 없음")}</p>
        <p><strong>${safeText("recGenreLabel", "영화 장르:")}</strong> ${movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : getTranslatedGenre(selectedGenre)}</p>

        <hr class="recommend-divider">
        <h3>${safeText("recMovieDesc", "🎬 영화 설명")}</h3>
        <p>${movie.overview || safeText("noOverview", "줄거리 정보가 없습니다.")}</p>

        <hr class="recommend-divider">
        <h3 style="color: #ff715b;">${pageMode === "mapPick" ? "🍽 선택한 식당" : safeText("recFoodRec", "🍽 추천 음식")}</h3>
        <p style="font-size: 1.5rem; font-weight: bold; color: #ff715b; background: rgba(255, 113, 91, 0.1); padding: 10px; border-radius: 8px; display: inline-block;">
            ${food.name}
        </p>

        <h3 style="margin-top: 15px;">${safeText("recReason", "💡 추천 사유")}</h3>
        <p>${reason}</p>
      </div>
    </div>
  `;

  hideRecommendOverlayLoading();
}

// ===============================
// 10. 좋아요 / 싫어요 / 조합 저장
// ===============================
function saveReaction(reactionType) {
  if (!currentMovie || !currentFood) return;
  const reaction = { movieId: currentMovie.id, movieTitle: currentMovie.title, ott: ottKey, meal: selectedMeal, genre: selectedGenre, foodName: currentFood.name, foodCategory: currentFood.category, reason: currentReason, reaction: reactionType, createdAt: new Date().toISOString() };
  const reactions = JSON.parse(localStorage.getItem("recommendReactions")) || [];
  const existingIndex = reactions.findIndex(item => item.movieId === reaction.movieId && item.foodName === reaction.foodName);
  if (existingIndex >= 0) reactions[existingIndex] = reaction;
  else reactions.push(reaction);
  localStorage.setItem("recommendReactions", JSON.stringify(reactions));
  alert(reactionType === "like" ? "좋아요가 반영되었습니다." : "싫어요가 반영되었습니다.");
}

function saveCombo() {
  if (!currentMovie || !currentFood) return;
  const combo = { movieId: currentMovie.id, movieTitle: currentMovie.title, posterPath: currentMovie.posterPath, ott: ottKey, meal: selectedMeal, genre: selectedGenre, foodName: currentFood.name, foodCategory: currentFood.category, reason: currentReason, savedAt: new Date().toISOString() };
  const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
  if (savedCombos.some(item => item.movieId === combo.movieId && item.foodName === combo.foodName)) {
    alert("이미 저장된 조합입니다."); return;
  }
  savedCombos.push(combo);
  localStorage.setItem("savedCombos", JSON.stringify(savedCombos));
  alert("조합이 저장되었습니다.");
  window.location.href = "index.html";
}

if (likeBtn) likeBtn.addEventListener("click", () => saveReaction("like"));
if (dislikeBtn) dislikeBtn.addEventListener("click", () => saveReaction("dislike"));
if (saveComboBtn) saveComboBtn.addEventListener("click", () => saveCombo());
if (backToMovieBtn) backToMovieBtn.addEventListener("click", () => window.location.href = `movie.html?ott=${ottKey}&meal=${encodeURIComponent(selectedMeal)}`);
if (backToMainBtn) backToMainBtn.addEventListener("click", () => window.location.href = "index.html");

// ===============================
// 11. 실행 (초기화 핵심 로직)
// ===============================
async function initRecommendPage() {
  let movie = null;

  if (pageMode === "mapPick") {
    showRecommendLoading("선택하신 식당 정보를 불러오는 중입니다...");

    // 핵심 수정: 이미 movieId가 존재하면 (영화->지도->식당선택 으로 온 경우) 기존 영화 정보 로드
    if (movieId) {
      movie = await fetchMovieDetailById(movieId);
    } else {
      // 만약 바로 식당을 고르고 온 경우라면 (메인->지도->식당선택), 식당 카테고리에 맞는 랜덤 영화 추출
      const recommendedGenre = getGenreFromFoodCategory(mapPickPlaceCategory);
      movie = await fetchRandomMovie(recommendedGenre);
    }
  } else {
    // 일반 영화 목록에서 넘어왔을 경우
    showRecommendLoading("추천 정보를 불러오는 중입니다...");
    if (!movieId) {
      alert("영화 정보가 없습니다. 영화 목록에서 다시 선택해주세요.");
      window.location.href = "index.html";
      return;
    }
    movie = await fetchMovieDetailById(movieId);
  }

  // 예외 처리
  if (!movie) {
    hideRecommendOverlayLoading();
    if (recommendDetailArea) recommendDetailArea.innerHTML = `<div class="saved-empty-card"><h3>영화 정보를 불러오지 못했습니다.</h3></div>`;
    return;
  }

  currentMovie = movie;

  // 화면 렌더링 분기
  if (pageMode === "mapPick") {
    currentFood = { name: mapPickPlaceName || "추천 식당", category: mapPickPlaceCategory || "기타" };
    currentReason = `선택하신 '${mapPickPlaceName}'의 음식과 ${movie.title} 영화는 최고의 조합이 될 것입니다! 맛있게 드시면서 즐거운 감상 되시길 바랍니다.`;
    renderRecommendDetail(currentMovie, currentFood, currentReason);

  } else if (pageMode === "saved" && savedFoodName) {
    hideReactionCard(); hideBackToMovieButton();
    currentFood = { name: savedFoodName, category: savedFoodCategory || "기타" };
    currentReason = savedReason || "저장된 추천 사유가 없습니다.";
    renderRecommendDetail(currentMovie, currentFood, currentReason);

  } else {
    showReactionCard(); showBackToMovieButton();
    const recommendation = makeFoodRecommendation(movie);
    currentFood = recommendation.food;
    currentReason = recommendation.reason;
    renderRecommendDetail(currentMovie, currentFood, currentReason);
  }
}

initRecommendPage();