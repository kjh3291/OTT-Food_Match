const selections = {
  ott: "",
  mood: "",
  meal: "",
};

const ottUrlMap = {
  "넷플릭스": "netflix",
  "디즈니+": "disney",
  "티빙": "tving",
  "웨이브": "wavve",
};

const recommendationDB = [
  {
    ott: "넷플릭스",
    mood: "스릴",
    meal: "야식",
    content: {
      title: "스릴러 영화 추천",
      genre: "범죄 / 스릴러",
      reason: "긴장감 있는 전개로 야식 시간에 몰입해서 보기 좋아요.",
    },
    food: {
      name: "피자 + 콜라",
      reason: "손이 자주 가지 않아도 편하게 먹을 수 있어 스릴러와 잘 어울려요.",
    },
  },
  {
    ott: "넷플릭스",
    mood: "웃긴",
    meal: "혼밥",
    content: {
      title: "코미디 시리즈 추천",
      genre: "코미디",
      reason: "가볍게 웃으면서 혼자 편하게 보기 좋아요.",
    },
    food: {
      name: "햄버거 세트",
      reason: "부담 없이 빠르게 먹을 수 있어 가벼운 시청 분위기와 잘 맞아요.",
    },
  },
  {
    ott: "디즈니+",
    mood: "로맨틱",
    meal: "연인과 함께",
    content: {
      title: "로맨스 영화 추천",
      genre: "로맨스 / 드라마",
      reason: "감정선이 부드러워 함께 보기 좋은 분위기를 만들어줘요.",
    },
    food: {
      name: "파스타 + 샐러드",
      reason: "분위기 있는 식사와 함께 즐기기 좋아요.",
    },
  },
  {
    ott: "티빙",
    mood: "가볍게",
    meal: "간단한 식사",
    content: {
      title: "예능 프로그램 추천",
      genre: "예능",
      reason: "짧고 편하게 볼 수 있어서 식사 중 부담이 적어요.",
    },
    food: {
      name: "김밥 + 떡볶이",
      reason: "간단하지만 만족감 있는 조합이라 캐주얼한 시청과 잘 맞아요.",
    },
  },
  {
    ott: "웨이브",
    mood: "감성",
    meal: "혼밥",
    content: {
      title: "감성 드라마 추천",
      genre: "드라마",
      reason: "천천히 몰입하며 보기 좋아 혼자 먹는 시간과 잘 어울려요.",
    },
    food: {
      name: "우동",
      reason: "따뜻하고 천천히 먹기 좋아 감성적인 분위기와 잘 맞아요.",
    },
  },
  {
    ott: "넷플릭스",
    mood: "몰입감",
    meal: "든든한 식사",
    content: {
      title: "몰입형 시리즈 추천",
      genre: "액션 / 미스터리",
      reason: "집중해서 보기 좋은 작품이라 든든한 식사와 함께하기 좋아요.",
    },
    food: {
      name: "치킨 + 감자튀김",
      reason: "만족감이 크고 오래 보면서 먹기 좋은 메뉴예요.",
    },
  },
];

const optionButtons = document.querySelectorAll(".option-btn");
const recommendBtn = document.getElementById("recommendBtn");
const resetBtn = document.getElementById("resetBtn");

const resultSection = document.getElementById("resultSection");
const contentResult = document.getElementById("contentResult");
const foodResult = document.getElementById("foodResult");
const bestMatchText = document.getElementById("bestMatchText");
const shareBtn = document.getElementById("shareBtn"); // 공유하기 버튼 추가

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;

    selections[type] = value;

    document
      .querySelectorAll(`.option-btn[data-type="${type}"]`)
      .forEach((btn) => btn.classList.remove("selected"));

    button.classList.add("selected");

    // OTT 버튼을 누르면 OTT 상세 페이지로 이동
    if (type === "ott") {
      const ottParam = ottUrlMap[value];
      window.location.href = `ott.html?ott=${ottParam}`;
    }
  });
});

recommendBtn.addEventListener("click", () => {
  const { ott, mood, meal } = selections;

  if (!ott || !mood || !meal) {
    alert("OTT, 분위기, 식사 상황을 모두 선택해주세요.");
    return;
  }

  let match = recommendationDB.find(
    (item) => item.ott === ott && item.mood === mood && item.meal === meal,
  );

  if (!match) {
    match = {
      ott,
      mood,
      meal,
      content: {
        title: `${ott} 추천 콘텐츠`,
        genre: `${mood} 분위기 콘텐츠`,
        reason: `${mood}한 분위기와 ${meal} 상황에 어울리는 콘텐츠를 추천해요.`,
      },
      food: {
        name: "치킨 또는 피자",
        reason: `${meal} 상황에서 무난하게 잘 어울리는 음식 조합이에요.`,
      },
    };
  }

  renderResult(match);
});

resetBtn.addEventListener("click", () => {
  selections.ott = "";
  selections.mood = "";
  selections.meal = "";

  optionButtons.forEach((btn) => btn.classList.remove("selected"));
  resultSection.classList.add("hidden");

  contentResult.innerHTML = "";
  foodResult.innerHTML = "";
  bestMatchText.textContent = "";
});

function renderResult(data) {
  contentResult.innerHTML = `
    <div class="result-item">
      <strong>${data.content.title}</strong>
      <p>장르: ${data.content.genre}</p>
      <p>${data.content.reason}</p>
    </div>
  `;

  foodResult.innerHTML = `
    <div class="result-item">
      <strong>${data.food.name}</strong>
      <p>${data.food.reason}</p>
    </div>
  `;

  bestMatchText.textContent = `${data.ott}의 ${data.mood} 분위기 콘텐츠와 ${data.food.name} 조합을 추천합니다. (${data.meal} 상황에 적합)`;

  resultSection.classList.remove("hidden");
}

// 💡 공유하기 기능 추가
shareBtn.addEventListener("click", () => {
  const { ott, mood, meal } = selections;
  
  // 클립보드에 복사될 텍스트 포맷 생성
  const shareText = `🍿 뭐 볼까, 뭐 먹을까 🍕\n\n[나의 선택]\n📺 OTT: ${ott}\n✨ 분위기: ${mood}\n🍽️ 상황: ${meal}\n\n[추천 결과]\n🎬 콘텐츠: ${bestMatchText.textContent.split("의")[0]}의 추천작\n🍕 음식: ${document.querySelector('#foodResult strong').innerText}\n\n우리 이거 같이 볼래? 👀`;

  // 클립보드 API를 사용해 텍스트 복사
  navigator.clipboard.writeText(shareText).then(() => {
    alert("추천 결과가 클립보드에 복사되었습니다!\n친구에게 붙여넣기(Ctrl+V)로 공유해보세요.");
  }).catch((err) => {
    alert("복사에 실패했습니다.");
    console.error('Clipboard Error:', err);
  });
});