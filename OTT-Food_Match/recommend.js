// ===============================
// 1. URL 값 가져오기
// ===============================

const urlParams = new URLSearchParams(window.location.search);

const movieId = urlParams.get("movieId");
const ottKey = urlParams.get("ott");

const selectedMeal = urlParams.get("meal")
  ? decodeURIComponent(urlParams.get("meal"))
  : "";

const selectedGenre = urlParams.get("genre")
  ? decodeURIComponent(urlParams.get("genre"))
  : "전체";

  const pageMode = urlParams.get("mode") || "recommend";

const savedFoodName = urlParams.get("foodName")
  ? decodeURIComponent(urlParams.get("foodName"))
  : "";

const savedFoodCategory = urlParams.get("foodCategory")
  ? decodeURIComponent(urlParams.get("foodCategory"))
  : "기타";

const savedReason = urlParams.get("reason")
  ? decodeURIComponent(urlParams.get("reason"))
  : "";

// ===============================
// 3. HTML 요소 가져오기
// ===============================

const recommendPageTitle = document.getElementById("recommendPageTitle");
const recommendPageInfo = document.getElementById("recommendPageInfo");
const recommendDetailArea = document.getElementById("recommendDetailArea");

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const saveComboBtn = document.getElementById("saveComboBtn");

const backToMovieBtn = document.getElementById("backToMovieBtn");
const backToMainBtn = document.getElementById("backToMainBtn");

const reactionCard =
  likeBtn?.closest(".card") ||
  document.querySelector(".reaction-area")?.closest(".card");

function showRecommendLoading(message = "추천 정보를 불러오는 중입니다...") {
  if (recommendDetailArea) {
    recommendDetailArea.innerHTML = `
      <div class="saved-empty-card recommend-loading-card">
        <div class="saved-empty-icon">🤖</div>
        <h3>${message}</h3>
        <p>잠시만 기다려주세요.</p>
      </div>
    `;
  }

  if (reactionCard) {
    reactionCard.style.display = "none";
  }
}

function showReactionCard() {
  if (reactionCard && pageMode !== "saved") {
    reactionCard.style.display = "";
  }
}

function hideReactionCard() {
  if (reactionCard) {
    reactionCard.style.display = "none";
  }
}

function hideBackToMovieButton() {
  if (backToMovieBtn) {
    backToMovieBtn.style.display = "none";
  }
}

function showBackToMovieButton() {
  if (backToMovieBtn) {
    backToMovieBtn.style.display = "";
  }
}

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

  const tmdbLangMap = {
    ko: "ko-KR",
    en: "en-US",
    zh: "zh-CN",
    ja: "ja-JP",
  };

  const tmdbLang = tmdbLangMap[lang] || "ko-KR";

  const url =
    `/api/movie-detail` +
    `?movieId=${encodeURIComponent(movieId)}` +
    `&lang=${encodeURIComponent(tmdbLang)}`;

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
// 8. 추천 음식 생성
// ===============================

function getPreferenceWeights() {
  return JSON.parse(localStorage.getItem("preferenceWeights")) || {};
}

function updatePreferenceWeights(reactionType) {
  if (!currentFood) return;

  const weights = getPreferenceWeights();
  const foodName = currentFood.name;
  const category = currentFood.category || "기타";

  if (!weights.foods) weights.foods = {};
  if (!weights.categories) weights.categories = {};
  if (!weights.meals) weights.meals = {};
  if (!weights.genres) weights.genres = {};

  const delta = reactionType === "like" ? 1 : -1;

  weights.foods[foodName] = (weights.foods[foodName] || 0) + delta;
  weights.categories[category] = (weights.categories[category] || 0) + delta;
  weights.meals[selectedMeal] = (weights.meals[selectedMeal] || 0) + delta;
  weights.genres[selectedGenre] = (weights.genres[selectedGenre] || 0) + delta;

  localStorage.setItem("preferenceWeights", JSON.stringify(weights));
}
 
function getUserSignals() {
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  return {
    savedCombos: read("savedCombos"),
    recommendReactions: read("recommendReactions"),
    matchHistory: read("matchHistory"),
  };
}

async function fetchAiFoodRecommendation(movie) {
  const preferenceWeights = getPreferenceWeights();

  const response = await fetch("/api/food-recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      movie,
      meal: selectedMeal,
      selectedGenre,
      preferenceWeights,
      ...getUserSignals(),
    }),
  });

  if (!response.ok) {
    throw new Error("AI 음식 추천 API 요청 실패");
  }

  const data = await response.json();

  if (!data.recommendation) {
    throw new Error("AI 음식 추천 응답 형식 오류");
  }

  return data.recommendation;
}

async function fetchAiMatchReason(movie, food) {
  const response = await fetch("/api/match-reason", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      movie,
      meal: selectedMeal,
      selectedGenre,
      foodName: food.name,
      foodCategory: food.category,
      ...getUserSignals(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("AI 매칭 사유 API 오류:", response.status, errorData);
    throw new Error(errorData?.message || "AI 매칭 사유 API 요청 실패");
  }

  const data = await response.json();

  if (!data.reason) {
    throw new Error("AI 매칭 사유 응답 형식 오류");
  }

  return data.reason;
}

function makeFallbackFoodRecommendation(movie) {
  const fallbackFoods = [
    { name: "치킨", category: "패스트푸드" },
    { name: "피자", category: "패스트푸드" },
    { name: "떡볶이", category: "식사" },
    { name: "햄버거", category: "패스트푸드" },
    { name: "파스타", category: "식사" },
    { name: "티라미수", category: "디저트" },
    { name: "샌드위치", category: "간식" },
    { name: "감자튀김", category: "간식" },
  ];

  const pickedFood =
    fallbackFoods[Math.floor(Math.random() * fallbackFoods.length)];

  return {
    foodName: pickedFood.name,
    foodCategory: pickedFood.category,
    reason: `${movie.title}의 분위기와 ${selectedMeal} 상황을 고려했을 때, ${pickedFood.name}은 부담 없이 즐기기 좋은 조합입니다.`,
    keywords: ["추천", selectedMeal, selectedGenre],
  };
}


// ===============================
// 9. 화면 출력
// ===============================

function renderRecommendDetail(movie, food, reason) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : "";

  recommendPageTitle.textContent = movie.title;
  recommendPageInfo.textContent = `식사 상황: ${selectedMeal} / 장르: ${selectedGenre}`;

  recommendDetailArea.innerHTML = `
    <div class="recommend-layout">
      <div class="recommend-poster-box">
        ${
          posterUrl
            ? `<img src="${posterUrl}" alt="${movie.title} 포스터" class="recommend-poster">`
            : `<div class="no-poster">포스터 없음</div>`
        }
      </div>

      <div class="recommend-content-box">
        <h2>${movie.title}</h2>
        <p><strong>개봉일:</strong> ${movie.releaseDate}</p>
        <p><strong>평점:</strong> ${
          movie.rating ? movie.rating.toFixed(1) : "정보 없음"
        }</p>
        <p><strong>상영 시간:</strong> ${
          movie.runtime ? movie.runtime + "분" : "정보 없음"
        }</p>
        <p><strong>영화 장르:</strong> ${
          movie.genres.length > 0 ? movie.genres.join(", ") : selectedGenre
        }</p>

        <hr class="recommend-divider">

        <h3>🎬 영화 설명</h3>
        <p>${movie.overview}</p>

        <hr class="recommend-divider">

        <h3>🍽 추천 음식</h3>
        <p><strong>${food.name}</strong></p>

        <h3>💡 추천 사유</h3>
        <p>${reason}</p>
      </div>
    </div>
  `;
}


// ===============================
// 10. 좋아요 / 싫어요 저장
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

  const existingIndex = reactions.findIndex(
    (item) =>
      item.movieId === reaction.movieId &&
      item.foodName === reaction.foodName
  );

  if (existingIndex >= 0) {
    reactions[existingIndex] = reaction;
  } else {
    reactions.push(reaction);
  }

  localStorage.setItem("recommendReactions", JSON.stringify(reactions));

updatePreferenceWeights(reactionType);

if (reactionType === "like") {
  alert("좋아요가 반영되었습니다. 다음 추천에 이 취향을 반영할게요.");
} else {
  alert("싫어요가 반영되었습니다. 다음 추천에서 비슷한 조합은 줄일게요.");
}
}


// ===============================
// 11. 조합 저장
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

  const isAlreadySaved = savedCombos.some(
    (item) =>
      item.movieId === combo.movieId &&
      item.foodName === combo.foodName
  );

  if (isAlreadySaved) {
  alert("이미 저장된 조합입니다. 메인으로 이동합니다.");
  window.location.href = "index.html";
  return;
}

  savedCombos.push(combo);
localStorage.setItem("savedCombos", JSON.stringify(savedCombos));

alert("조합이 저장되었습니다. 메인으로 이동합니다.");
window.location.href = "index.html";
}


// ===============================
// 12. 버튼 이벤트
// ===============================

if (likeBtn) {
  likeBtn.addEventListener("click", () => {
    saveReaction("like");
  });
}

if (dislikeBtn) {
  dislikeBtn.addEventListener("click", () => {
    saveReaction("dislike");
  });
}

if (saveComboBtn) {
  saveComboBtn.addEventListener("click", () => {
    saveCombo();
  });
}

if (backToMovieBtn) {
  backToMovieBtn.addEventListener("click", () => {
    const mealParam = encodeURIComponent(selectedMeal);
    const genreParam = encodeURIComponent(selectedGenre);

    window.location.href =
      `movie.html?ott=${ottKey}` +
      `&meal=${mealParam}` +
      `&genre=${genreParam}`;
  });
}

if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}


// ===============================
// 13. 설정 팝업 + 다크 모드
// ===============================

const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");
const darkModeToggle = document.getElementById("darkModeToggle");

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

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");

  if (darkModeToggle) {
    darkModeToggle.textContent = getLang() === "ko" ? "☀️ 라이트 모드" : "☀️ Light Mode";
  }
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark-mode") ? "dark" : "light"
    );

    document.dispatchEvent(new Event("languageChanged"));
  });
}


// ===============================
// 14. 실행
// ===============================


async function initRecommendPage() {
  showRecommendLoading(
    pageMode === "saved"
      ? "저장된 조합을 불러오는 중입니다..."
      : "AI가 음식 조합을 고르는 중이에요"
  );

  const movie = await fetchMovieDetail();

  if (!movie) {
    hideReactionCard();

    recommendDetailArea.innerHTML = `
      <div class="saved-empty-card">
        <div class="saved-empty-icon">⚠️</div>
        <h3>영화 정보를 불러오지 못했습니다.</h3>
        <p>영화 목록에서 다시 선택해주세요.</p>
      </div>
    `;
    return;
  }

  currentMovie = movie;

  // ===============================
  // 저장 조합 보기 모드
  // ===============================
  if (pageMode === "saved") {
    currentFood = {
      name: savedFoodName || "저장된 음식 정보 없음",
      category: savedFoodCategory || "기타",
    };

    currentReason = savedReason || "저장된 추천 사유가 없습니다.";

    renderRecommendDetail(currentMovie, currentFood, currentReason);
    hideReactionCard();
    hideBackToMovieButton();

    if (recommendPageInfo) {
      recommendPageInfo.textContent = `저장된 조합 / 식사 상황: ${selectedMeal} / 장르: ${selectedGenre}`;
    }

    return;
  }

  if (pageMode === "aiPick") {
  showBackToMovieButton();

  currentFood = {
    name: savedFoodName || "추천 음식 정보 없음",
    category: savedFoodCategory || "AI 추천",
  };

  showRecommendLoading("영화와 음식의 매칭 사유를 작성하는 중입니다...");

  try {
    currentReason = await fetchAiMatchReason(currentMovie, currentFood);
  } catch (error) {
    console.warn("AI 매칭 사유 생성 실패, 기본 사유로 대체:", error);

    currentReason =
      savedReason ||
      `${currentMovie.title}의 분위기와 ${selectedMeal} 상황을 고려했을 때, ${currentFood.name}은 잘 어울리는 조합입니다.`;
  }

  renderRecommendDetail(currentMovie, currentFood, currentReason);

  if (recommendPageInfo) {
    recommendPageInfo.textContent = `AI가 골라본 조합 / 식사 상황: ${selectedMeal} / 장르: ${selectedGenre}`;
  }

  showReactionCard();

  return;
}

  // ===============================
  // 일반 추천 모드
  // ===============================
  showBackToMovieButton();
  showRecommendLoading("AI가 음식 조합을 고르는 중이에요");

  try {
    const aiRecommendation = await fetchAiFoodRecommendation(movie);

    currentFood = {
      name: aiRecommendation.foodName,
      category: aiRecommendation.foodCategory || "기타",
    };

    currentReason = aiRecommendation.reason;

    renderRecommendDetail(currentMovie, currentFood, currentReason);
    showReactionCard();
  } catch (error) {
    console.warn("AI 추천 실패, 기본 추천으로 대체:", error);

    const fallback = makeFallbackFoodRecommendation(movie);

    currentFood = {
      name: fallback.foodName,
      category: fallback.foodCategory || "기타",
    };

    currentReason = fallback.reason;

    renderRecommendDetail(currentMovie, currentFood, currentReason);
    showReactionCard();
  }
}

initRecommendPage();
