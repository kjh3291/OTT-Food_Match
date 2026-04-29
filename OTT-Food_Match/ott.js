// --- [추가된 부분: API 연동 테스트 로직] ---

// config.js에서 선언한 TMDB_API_KEY가 잘 불러와졌는지 확인 (콘솔 출력)
console.log("현재 불러온 API 키:", CONFIG.TMDB_API_KEY ? "키 정상 인식됨" : "키를 찾을 수 없음!");

// TMDB API 정상 작동 확인을 위한 테스트 함수
async function testTMDBAPI() {
  if (!CONFIG.TMDB_API_KEY) {
    console.error("🚨 오류: API 키가 없습니다. config.js 연결을 확인하세요.");
    return;
  }

  // 장르 목록을 불러오는 테스트 엔드포인트
  const testUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${CONFIG.TMDB_API_KEY}&language=ko-KR`;

  try {
    const response = await fetch(testUrl);

    // 정상적으로 데이터를 받았을 경우 (HTTP 상태 코드 200)
    if (response.ok) {
      const data = await response.json();
      console.log("✅ TMDB API 연결 성공! 장르 데이터를 정상적으로 받아왔습니다.");
      console.log("받아온 장르 데이터 미리보기:", data.genres);
      // alert("API 연동 테스트 성공!"); // 필요하다면 화면에 알림을 띄울 수도 있습니다.
    } else {
      // 키가 틀렸거나 주소가 잘못되었을 경우
      console.error(`🚨 API 요청 실패 (상태 코드: ${response.status})`);
    }
  } catch (error) {
    console.error("🚨 네트워크 오류 또는 API 연동 실패:", error);
  }
}

// 스크립트가 실행될 때 가장 먼저 테스트 함수를 호출합니다.
testTMDBAPI();

const ottNameMap = {
  netflix: "넷플릭스",
  disney: "디즈니+",
  tving: "티빙",
  wavve: "웨이브",
};

const sampleContents = {
  netflix: [
    {
      title: "스릴러 추천작",
      genre: "스릴러",
      mealTags: ["야식", "혼밥"],
      description: "긴장감 있는 분위기의 콘텐츠입니다.",
    },
    {
      title: "코미디 시리즈",
      genre: "코미디",
      mealTags: ["혼밥", "간단한 식사", "친구와 함께"],
      description: "가볍게 웃으면서 보기 좋은 콘텐츠입니다.",
    },
    {
      title: "몰입형 드라마",
      genre: "드라마",
      mealTags: ["든든한 식사", "혼밥"],
      description: "한 번 보면 계속 보게 되는 몰입감 있는 작품입니다.",
    },
  ],

  disney: [
    {
      title: "디즈니 애니메이션",
      genre: "애니메이션",
      mealTags: ["친구와 함께", "연인과 함께", "간단한 식사"],
      description: "가족, 친구, 연인과 함께 보기 좋은 콘텐츠입니다.",
    },
    {
      title: "마블 액션 영화",
      genre: "액션",
      mealTags: ["든든한 식사", "친구와 함께", "야식"],
      description: "화려한 액션과 세계관을 즐길 수 있는 작품입니다.",
    },
  ],

  tving: [
    {
      title: "인기 예능",
      genre: "예능",
      mealTags: ["혼밥", "간단한 식사", "친구와 함께"],
      description: "밥 먹으면서 가볍게 보기 좋은 예능 콘텐츠입니다.",
    },
    {
      title: "한국 드라마",
      genre: "드라마",
      mealTags: ["혼밥", "연인과 함께", "야식"],
      description: "감정선이 좋은 한국형 드라마 콘텐츠입니다.",
    },
  ],

  wavve: [
    {
      title: "감성 드라마",
      genre: "드라마",
      mealTags: ["혼밥", "야식"],
      description: "혼밥이나 야식 시간에 잔잔하게 보기 좋습니다.",
    },
    {
      title: "국내 예능",
      genre: "예능",
      mealTags: ["간단한 식사", "친구와 함께", "혼밥"],
      description: "부담 없이 즐길 수 있는 국내 예능 콘텐츠입니다.",
    },
  ],
};

const selections = {
  genre: "",
  meal: "",
};

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");

const ottTitle = document.getElementById("ottTitle");
const optionButtons = document.querySelectorAll(".option-btn");
const recommendContentBtn = document.getElementById("recommendContentBtn");
const contentSection = document.getElementById("contentSection");
const contentList = document.getElementById("contentList");
const backBtn = document.getElementById("backBtn");

const foodRecommendSection = document.getElementById("foodRecommendSection");
const selectedContentTitle = document.getElementById("selectedContentTitle");
const selectedContentInfo = document.getElementById("selectedContentInfo");
const aiFoodResult = document.getElementById("aiFoodResult");

const ottName = ottNameMap[ottKey] || "OTT";
ottTitle.textContent = `${ottName} 콘텐츠 추천`;

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;

    selections[type] = value;

    document
      .querySelectorAll(`.option-btn[data-type="${type}"]`)
      .forEach((btn) => btn.classList.remove("selected"));

    button.classList.add("selected");

    contentSection.classList.add("hidden");
    foodRecommendSection.classList.add("hidden");
  });
});

recommendContentBtn.addEventListener("click", () => {
  const { genre, meal } = selections;

  if (!genre || !meal) {
    alert("장르와 식사 상황을 모두 선택해주세요.");
    return;
  }

  renderRecommendedContents(genre, meal);
});

function getRecommendedContents(genre, meal) {
  const contents = sampleContents[ottKey] || [];

  const exactMatches = contents.filter((content) => {
    return content.genre === genre && content.mealTags.includes(meal);
  });

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  const genreMatches = contents.filter((content) => {
    return content.genre === genre;
  });

  if (genreMatches.length > 0) {
    return genreMatches;
  }

  const mealMatches = contents.filter((content) => {
    return content.mealTags.includes(meal);
  });

  if (mealMatches.length > 0) {
    return mealMatches;
  }

  return contents;
}

function renderRecommendedContents(genre, meal) {
  const recommendedContents = getRecommendedContents(genre, meal);

  if (recommendedContents.length === 0) {
    contentList.innerHTML = `
      <div class="result-card">
        <p>추천할 콘텐츠가 없습니다.</p>
      </div>
    `;

    contentSection.classList.remove("hidden");
    return;
  }

  contentList.innerHTML = recommendedContents
    .map((content, index) => {
      return `
        <div class="result-item">
          <strong>${content.title}</strong>
          <p>장르: ${content.genre}</p>
          <p>추천 상황: ${content.mealTags.join(", ")}</p>
          <p>${content.description}</p>
          <button class="primary-btn food-recommend-btn" data-index="${index}">
            이 콘텐츠에 어울리는 음식 추천받기
          </button>
        </div>
      `;
    })
    .join("");

  const foodRecommendButtons = document.querySelectorAll(".food-recommend-btn");

  foodRecommendButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedIndex = button.dataset.index;
      const selectedContent = recommendedContents[selectedIndex];

      recommendFoodForContent(selectedContent);
    });
  });

  contentSection.classList.remove("hidden");
  foodRecommendSection.classList.add("hidden");
}

function recommendFoodForContent(content) {
  let foodRecommendation = {
    name: "치킨 + 콜라",
    reason: "대부분의 콘텐츠와 무난하게 잘 어울리는 조합입니다.",
  };

  if (content.genre === "스릴러") {
    foodRecommendation = {
      name: "피자 + 콜라",
      reason: "스릴러는 긴장감이 강하기 때문에 손쉽게 먹을 수 있는 피자가 잘 어울립니다.",
    };
  } else if (content.genre === "코미디" || content.genre === "예능") {
    foodRecommendation = {
      name: "떡볶이 + 튀김",
      reason: "가볍고 즐거운 분위기의 콘텐츠에는 부담 없이 먹기 좋은 분식 조합이 잘 맞습니다.",
    };
  } else if (content.genre === "드라마") {
    foodRecommendation = {
      name: "우동",
      reason: "드라마의 잔잔한 감정선과 따뜻한 국물 음식이 잘 어울립니다.",
    };
  } else if (content.genre === "로맨스") {
    foodRecommendation = {
      name: "파스타 + 샐러드",
      reason: "로맨틱한 분위기에는 깔끔하고 분위기 있는 음식이 잘 어울립니다.",
    };
  } else if (content.genre === "액션") {
    foodRecommendation = {
      name: "치킨 + 감자튀김",
      reason: "액션 콘텐츠의 빠르고 강한 분위기에는 든든하고 자극적인 음식이 잘 어울립니다.",
    };
  } else if (content.genre === "애니메이션") {
    foodRecommendation = {
      name: "햄버거 세트",
      reason: "가족이나 친구와 편하게 보기 좋은 애니메이션에는 간단하고 대중적인 음식이 잘 어울립니다.",
    };
  }

  selectedContentTitle.textContent = `선택한 콘텐츠: ${content.title}`;
  selectedContentInfo.textContent = `장르: ${content.genre} / ${content.description}`;

  aiFoodResult.innerHTML = `
    <div class="result-item">
      <strong>${foodRecommendation.name}</strong>
      <p>${foodRecommendation.reason}</p>
    </div>
  `;

  foodRecommendSection.classList.remove("hidden");
}

backBtn.addEventListener("click", () => {
  window.location.href = "main.html";
});