import { foodCategories } from './food.js';
import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ===============================
// 1. URL 값 가져오기
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

const mapPickPlaceName = urlParams.get("placeName") || null;
const mapPickPlaceCategory = urlParams.get("placeCategory") || null;

// ===============================
// 2. 음식 데이터 평면화 (💡 7개 카테고리 정확히 연동)
// ===============================
const allFoods = [];
for (const [category, foods] of Object.entries(foodCategories)) {
  for (const food of foods) {
    allFoods.push({ name: food, category: category }); // "한식", "치킨" 등 7종
  }
}

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
    recommendDetailArea.innerHTML = `<div class="saved-empty-card recommend-loading-card"><div class="saved-empty-icon">🤖</div><h3>${message}</h3><p>잠시만 기다려주세요.</p></div>`;
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

let currentMovie = null;
let currentFood = null;
let currentReason = "";

// ===============================
// 4. 영화 가져오기 로직 
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
    return null;
  }
}

function getGenreFromFoodCategory(category) {
  if (!category) return "전체";
  const cat = category.toLowerCase();
  if (cat.includes("디저트") || cat.includes("카페")) return "로맨스";
  if (cat.includes("치킨") || cat.includes("패스트푸드") || cat.includes("야식")) return "액션";
  if (cat.includes("중식")) return "코미디";
  if (cat.includes("한식") || cat.includes("일식") || cat.includes("양식") || cat.includes("초밥")) return "드라마";
  return "전체";
}

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
      if (genre !== "전체") return await fetchRandomMovie("전체");
      return null;
    }

    const randomMovie = data.movies[Math.floor(Math.random() * data.movies.length)];
    movieId = randomMovie.id;
    selectedGenre = genre;
    return await fetchMovieDetailById(randomMovie.id);
  } catch (error) {
    return null;
  }
}

// ===============================
// 5. 7개 카테고리에 맞춘 매칭 알고리즘 
// ===============================
function getCategoriesForSituation(genre, meal) {
  let tags = [];

  // 1. 장르별 최적의 카테고리 매칭 (7개 중)
  if (genre === "액션") {
    tags = ["치킨", "패스트푸드", "중식"];
  } else if (genre === "코미디") {
    tags = ["패스트푸드", "치킨", "중식"];
  } else if (genre === "드라마") {
    tags = ["한식", "일식", "양식"];
  } else if (genre === "로맨스") {
    tags = ["양식", "디저트"];
  } else if (genre === "스릴러") {
    tags = ["치킨", "패스트푸드"];
  } else if (genre === "애니메이션") {
    tags = ["디저트", "패스트푸드"];
  } else {
    tags = Object.keys(foodCategories); // 전체
  }

  // 2. 식사 상황(meal) 보정
  if (meal === "야식") {
    tags.push("치킨", "패스트푸드", "중식");
  } else if (meal === "간단한 식사") {
    tags.push("패스트푸드", "디저트");
  } else if (meal === "든든한 식사") {
    tags.push("한식", "중식", "일식", "양식");
  } else if (meal === "디저트") {
    tags.push("디저트");
  }

  return [...new Set(tags)];
}

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
  const targetCategories = getCategoriesForSituation(selectedGenre, selectedMeal);
  let filteredFoods = allFoods.filter(food => targetCategories.includes(food.category));

  if (!filteredFoods || filteredFoods.length === 0) {
    filteredFoods = allFoods;
  }
  const food = filteredFoods[Math.floor(Math.random() * filteredFoods.length)];
  return { food, reason: makeRecommendReason(movie, food) };
}

// ===============================
// 6. 화면 출력 및 버튼 연동
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

function renderRecommendDetail(movie, food, reason) {
  const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "";
  recommendPageTitle.textContent = movie.title;
  if (recommendPageInfo) recommendPageInfo.textContent = `식사 상황: ${selectedMeal} / 영화 장르: ${selectedGenre}`;

  // 💡 지도 URL (정확히 추출한 category 값 사용)
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

  const isMapPick = (pageMode === "mapPick");
  const foodTitle = isMapPick ? "🍽 선택한 식당" : safeText("recFoodRec", "🍽 추천 음식");

  recommendDetailArea.innerHTML = `
    <div class="recommend-layout">
      <div class="recommend-poster-box">
        ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="recommend-poster">` : `<div class="no-poster">${safeText("noPoster", "포스터 없음")}</div>`}
        <button onclick="window.location.href='${mapUrl}'" style="width: 100%; margin-top: 15px; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; font-weight: bold; font-size: 15px; cursor: pointer; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4); transition: 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
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
        <h3 style="color: #ff715b;">${foodTitle}</h3>
        <p style="font-size: 1.5rem; font-weight: bold; color: #ff715b; background: rgba(255, 113, 91, 0.1); padding: 10px; border-radius: 8px; display: inline-block;">${food.name}</p>
        <h3 style="margin-top: 15px;">${safeText("recReason", "💡 추천 사유")}</h3>
        <p>${reason}</p>
      </div>
    </div>
  `;
  hideRecommendOverlayLoading();
}

// ===============================
// 7. 기타 기능 및 실행
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

async function saveCombo() {
  if (!currentMovie || !currentFood) return;

  const user = auth.currentUser;
  if (!user) {
    alert("로그인이 필요한 기능입니다. 메인 화면에서 먼저 로그인해주세요!");
    return;
  }
  const combo = {
    userId: user.uid, // ⭐️ 내 계정 식별자
    movieId: currentMovie.id,
    movieTitle: currentMovie.title,
    posterPath: currentMovie.posterPath,
    ott: ottKey,
    meal: selectedMeal,
    genre: selectedGenre,
    foodName: currentFood.name,
    foodCategory: currentFood.category,
    reason: currentReason,
    savedAt: new Date().toISOString()
  };
  try {
    // 1. DB에서 중복 저장 여부 확인
    const q = query(collection(db, "savedCombos"),
      where("userId", "==", user.uid),
      where("movieId", "==", combo.movieId),
      where("foodName", "==", combo.foodName)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("이미 저장된 조합입니다.");
      return;
    }

    // 2. DB에 최종 저장
    await addDoc(collection(db, "savedCombos"), combo);

    // 3. 브라우저 로컬 캐시 업데이트
    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    savedCombos.push(combo);
    localStorage.setItem("savedCombos", JSON.stringify(savedCombos));

    alert("조합이 내 계정에 안전하게 저장되었습니다!");
    window.location.href = "index.html";

  } catch (error) {
    console.error("저장 오류:", error);
    alert("저장에 실패했습니다.");
  }
}

if (likeBtn) likeBtn.addEventListener("click", () => saveReaction("like"));
if (dislikeBtn) dislikeBtn.addEventListener("click", () => saveReaction("dislike"));
if (saveComboBtn) saveComboBtn.addEventListener("click", () => saveCombo());
if (backToMovieBtn) backToMovieBtn.addEventListener("click", () => window.location.href = `movie.html?ott=${ottKey}&meal=${encodeURIComponent(selectedMeal)}`);
if (backToMainBtn) backToMainBtn.addEventListener("click", () => window.location.href = "index.html");

async function initRecommendPage() {
  let movie = null;
  if (pageMode === "mapPick") {
    showRecommendLoading("선택하신 식당 정보를 불러오는 중입니다...");
    if (movieId) movie = await fetchMovieDetailById(movieId);
    else movie = await fetchRandomMovie(getGenreFromFoodCategory(mapPickPlaceCategory));
  } else {
    showRecommendLoading("추천 정보를 불러오는 중입니다...");
    if (!movieId) { alert("영화 정보가 없습니다. 영화 목록에서 다시 선택해주세요."); window.location.href = "index.html"; return; }
    movie = await fetchMovieDetailById(movieId);
  }

  if (!movie) {
    hideRecommendOverlayLoading();
    if (recommendDetailArea) recommendDetailArea.innerHTML = `<div class="saved-empty-card"><h3>영화 정보를 불러오지 못했습니다.</h3></div>`;
    return;
  }

  currentMovie = movie;

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
// ===============================
// 8. 설정 팝업, 다크모드, 다국어 모달 연동 (복구됨!)
// ===============================
const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");
const darkModeToggle = document.getElementById("darkModeToggle");
const langMenuBtn = document.getElementById("langMenuBtn");
const langModal = document.getElementById("langModal");
const closeLangModal = document.getElementById("closeLangModal");

// 1. 설정 팝업 열기/닫기
if (settingBtn && settingPopup) {
  settingBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    settingPopup.classList.toggle("hidden");
  });

  settingPopup.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  // 빈 바탕 클릭 시 팝업 닫기
  document.addEventListener("click", () => {
    settingPopup.classList.add("hidden");
  });
}

// 2. 다크 모드 토글 연동
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  if (darkModeToggle) {
    darkModeToggle.textContent = typeof getLang === 'function' && getLang() === "ko" ? "☀️ 라이트 모드"
      : (typeof getLang === 'function' && getLang() === "en" ? "☀️ Light Mode"
        : (typeof getLang === 'function' && getLang() === "zh" ? "☀️ 浅色模式" : "☀️ ライトモード"));
  }
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    document.dispatchEvent(new Event("languageChanged"));
  });
}

// 3. 언어 설정 모달 띄우기
if (langMenuBtn && langModal) {
  langMenuBtn.addEventListener("click", () => {
    settingPopup.classList.add("hidden"); // 설정 팝업 닫고
    langModal.classList.remove("hidden"); // 언어 모달 열기
  });
}

// 4. 언어 모달 닫기
if (closeLangModal && langModal) {
  closeLangModal.addEventListener("click", () => {
    langModal.classList.add("hidden");
  });
}

// 5. 언어 변경 시 화면 추천 텍스트 즉시 새로고침
document.addEventListener("languageChanged", () => {
  if (currentMovie && currentFood) {
    currentReason = makeRecommendReason(currentMovie, currentFood);
    renderRecommendDetail(currentMovie, currentFood, currentReason);
  }
});
initRecommendPage();