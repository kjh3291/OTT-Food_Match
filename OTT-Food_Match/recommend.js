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


// ===============================
// 2. 음식 데이터 준비
// ===============================

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

const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");
const saveComboBtn = document.getElementById("saveComboBtn");

const backToMovieBtn = document.getElementById("backToMovieBtn");
const backToMainBtn = document.getElementById("backToMainBtn");


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
  const apiKey = window.CONFIG?.TMDB_API_KEY;
  const baseUrl = window.CONFIG?.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!apiKey) {
    alert("TMDB API Key가 없습니다. config.js를 확인해주세요.");
    return null;
  }

  if (!movieId) {
    alert("영화 정보가 없습니다. 영화 목록에서 다시 선택해주세요.");
    window.location.href = "main.html";
    return null;
  }

  const url =
    `${baseUrl}/movie/${movieId}` +
    `?api_key=${apiKey}` +
    `&language=ko-KR`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("영화 상세 정보 요청 실패:", response.status);
      alert("영화 상세 정보를 불러오지 못했습니다.");
      return null;
    }

    const movie = await response.json();

    return {
      id: movie.id,
      title: movie.title || "제목 없음",
      overview: movie.overview || "줄거리 정보가 없습니다.",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "개봉일 정보 없음",
      rating: movie.vote_average,
      runtime: movie.runtime || 0,
      genres: movie.genres ? movie.genres.map((genre) => genre.name) : [],
    };
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
    case "액션":
      return ["패스트푸드", "식사"];
    case "코미디":
      return ["식사"];
    case "드라마":
      return ["디저트"];
    case "로맨스":
      return ["디저트"];
    case "스릴러":
      return ["패스트푸드"];
    case "애니메이션":
      return ["패스트푸드", "디저트"];
    default:
      return ["식사", "패스트푸드", "디저트"];
  }
}

function getFoodsByCategories(categories) {
  return allFoods.filter((food) => categories.includes(food.category));
}


// ===============================
// 7. 추천 사유 만들기
// ===============================

function makeRecommendReason(movie, food) {
  let reason = "";

  if (selectedGenre === "액션") {
    reason += "액션 영화는 빠른 전개와 강한 몰입감이 특징입니다. ";
    reason += `${food.name}은 영화에 집중하면서 먹기 좋고, 자극적인 분위기와 잘 어울립니다. `;
  } else if (selectedGenre === "코미디") {
    reason += "코미디 영화는 가볍고 즐거운 분위기가 중요합니다. ";
    reason += `${food.name}은 부담 없이 먹기 좋아서 편안한 감상 분위기를 만들어줍니다. `;
  } else if (selectedGenre === "드라마") {
    reason += "드라마 영화는 감정선과 몰입감이 중요한 장르입니다. ";
    reason += `${food.name}은 차분한 분위기에서 영화를 보기 좋게 만들어줍니다. `;
  } else if (selectedGenre === "로맨스") {
    reason += "로맨스 영화는 부드럽고 감성적인 분위기가 중요합니다. ";
    reason += `${food.name}은 분위기를 해치지 않고 깔끔하게 즐기기 좋습니다. `;
  } else if (selectedGenre === "스릴러") {
    reason += "스릴러 영화는 긴장감이 강하고 화면 집중도가 높은 장르입니다. ";
    reason += `${food.name}은 간단히 먹을 수 있어 영화 흐름을 방해하지 않습니다. `;
  } else if (selectedGenre === "애니메이션") {
    reason += "애니메이션은 편하게 즐기기 좋은 경우가 많습니다. ";
    reason += `${food.name}은 가볍게 먹기 좋아서 캐주얼한 감상에 잘 어울립니다. `;
  } else {
    reason += "전체 장르에서는 부담 없이 즐길 수 있는 음식 조합이 좋습니다. ";
    reason += `${food.name}은 다양한 영화와 무난하게 어울리는 메뉴입니다. `;
  }

  if (selectedMeal === "혼밥") {
    reason += "또한 혼밥 상황에서는 혼자 먹기 편하고 준비 부담이 적은 음식이 적합합니다.";
  } else if (selectedMeal === "야식") {
    reason += "또한 야식 상황에서는 너무 복잡하지 않고 편하게 먹을 수 있는 음식이 잘 맞습니다.";
  } else if (selectedMeal === "친구와 함께") {
    reason += "또한 친구와 함께 볼 때는 나눠 먹기 좋은 음식일수록 만족도가 높아집니다.";
  } else if (selectedMeal === "연인과 함께") {
    reason += "또한 연인과 함께라면 분위기를 해치지 않고 깔끔하게 먹을 수 있는 조합이 좋습니다.";
  } else if (selectedMeal === "간단한 식사") {
    reason += "또한 간단한 식사 상황이기 때문에 부담 없이 먹을 수 있는 메뉴가 잘 어울립니다.";
  } else if (selectedMeal === "든든한 식사") {
    reason += "또한 든든한 식사가 필요한 상황이므로 포만감 있는 메뉴가 더 잘 어울립니다.";
  }

  return reason;
}


// ===============================
// 8. 추천 음식 생성
// ===============================

function makeFoodRecommendation(movie) {
  const categories = getCategoriesFromGenre(selectedGenre);
  const filteredFoods = getFoodsByCategories(categories);

  const food = recommend(filteredFoods);

  return {
    food,
    reason: makeRecommendReason(movie, food),
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

  if (reactionType === "like") {
    alert("좋아요가 반영되었습니다.");
  } else {
    alert("싫어요가 반영되었습니다.");
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
    alert("이미 저장된 조합입니다.");
    return;
  }

  savedCombos.push(combo);
  localStorage.setItem("savedCombos", JSON.stringify(savedCombos));

  alert("조합이 저장되었습니다.");
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
    window.location.href = `movie.html?ott=${ottKey}&meal=${mealParam}`;
  });
}

if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => {
    window.location.href = "main.html";
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
// ===============================
// 14. 실행
// ===============================

// 누락되었던 음식 추천 연결 함수를 추가합니다.
function makeFoodRecommendation(movie) {
  // allFoods 배열과 recommend 함수가 로드되어 있는 경우
  if (typeof allFoods !== "undefined" && allFoods.length > 0 && typeof recommend === "function") {
    const foodObj = recommend(allFoods);
    return {
      food: foodObj.name,
      reason: `${movie.title}의 분위기와 어울리는 특별한 조합입니다.`
    };
  }
  // 로드되지 않았을 경우의 기본값 방어 코드
  return { food: "치킨과 콜라", reason: "어떤 영화와도 잘 어울리는 무난한 조합입니다." };
}

async function initRecommendPage() {
  let movie = null;
  if (typeof fetchMovieDetail === "function") {
    movie = await fetchMovieDetail();
  }

  if (!movie) {
    if (typeof recommendDetailArea !== "undefined") {
      recommendDetailArea.innerHTML = `<p>영화 정보를 불러오지 못했습니다.</p>`;
    }
    return;
  }

  currentMovie = movie;

  const recommendation = makeFoodRecommendation(movie);
  currentFood = recommendation.food;
  currentReason = recommendation.reason;
  
  // 이후 화면에 데이터를 렌더링하는 코드 추가 필요
}

// 스크립트가 로드되면 페이지 초기화 실행
initRecommendPage();
