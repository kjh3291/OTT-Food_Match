// 1. 상태 관리 객체
const state = {
  currentStep: 1,
  primary: "",
  situation: "",
  detail: "",
  ott: ""
};

// 다국어 번역 데이터 사전
const translations = {
  ko: {
    settingBtn: "⚙ 설정", settingTitle: "설정", langToggle: "🌐 English",
    mainTitle: "🍿 뭐 볼까, 뭐 먹을까", mainDesc: "OTT와 음식 조합을 한 번에 추천해주는 서비스",
    step1Title: "1. 어떤 것을 먼저 고르시겠어요?", step1Opt1: "📺 볼 콘텐츠(OTT) 기준", step1Opt2: "🍕 먹을 음식 메뉴 기준",
    step2Title: "2. 현재 식사 상황은 어떠신가요?",
    meal_honbab: "혼밥", meal_yasik: "야식", meal_friends: "친구와 함께", meal_couple: "연인과 함께", meal_light: "간단한 식사", meal_heavy: "든든한 식사",
    step3OttTitle: "3. 이용 중인 OTT 플랫폼을 알려주세요.", step3FoodTitle: "3. 어떤 종류의 음식이 끌리시나요?",
    food_chicken_pizza: "치킨/피자", food_bunsik: "분식(떡볶이 등)", food_korean: "한식(국밥/찌개)", food_western: "양식(파스타 등)",
    prevBtn: "이전 단계", nextBtn: "다음 단계", nextBtnResult: "추천 결과 보기 ✨",
    loadingTitle: "맞춤 조합을 찾는 중입니다...", loadingDesc: "잠시만 기다려주세요 🍿",
    resultTitle: "✨ 맞춤 추천 결과 ✨", resContentTitle: "🎬 추천 콘텐츠", resFoodTitle: "🍕 추천 음식", resComboTitle: "💡 Best Match Combo",
    shareBtn: "결과 공유하기 🔗", resetBtn: "처음부터 다시하기",
    alert_primary: "기준을 선택해주세요.", alert_situation: "현재 상황을 선택해주세요.", alert_detail: "상세 항목을 선택해주세요.",
    alert_ott: "올바른 OTT를 선택해주세요.", alert_error: "결과를 불러오는 중 문제가 발생했습니다.", alert_copied: "추천 결과가 복사되었습니다!"
  },
  en: {
    settingBtn: "⚙ Settings", settingTitle: "Settings", langToggle: "🌐 한국어",
    mainTitle: "🍿 What to Watch, What to Eat", mainDesc: "OTT and food combination recommendation service",
    step1Title: "1. Which one would you like to choose first?", step1Opt1: "📺 Based on Content (OTT)", step1Opt2: "🍕 Based on Food Menu",
    step2Title: "2. What is your current meal situation?",
    meal_honbab: "Eating Alone", meal_yasik: "Late Night Snack", meal_friends: "With Friends", meal_couple: "With Partner", meal_light: "Light Meal", meal_heavy: "Hearty Meal",
    step3OttTitle: "3. Please select your OTT platform.", step3FoodTitle: "3. What kind of food are you craving?",
    food_chicken_pizza: "Chicken/Pizza", food_bunsik: "Street Food", food_korean: "Korean Food", food_western: "Western Food",
    prevBtn: "Previous", nextBtn: "Next", nextBtnResult: "View Recommendation ✨",
    loadingTitle: "Finding the perfect match...", loadingDesc: "Please wait a moment 🍿",
    resultTitle: "✨ Custom Recommendation Results ✨", resContentTitle: "🎬 Recommended Content", resFoodTitle: "🍕 Recommended Food", resComboTitle: "💡 Best Match Combo",
    shareBtn: "Share Results 🔗", resetBtn: "Restart",
    alert_primary: "Please select a criteria.", alert_situation: "Please select your current situation.", alert_detail: "Please select a detailed item.",
    alert_ott: "Please select a valid OTT.", alert_error: "A problem occurred while fetching results.", alert_copied: "Recommendation results copied!"
  }
};

// HTML 요소 맵핑
const steps = {
  1: document.getElementById("step1"),
  2: document.getElementById("step2"),
  "3-ott": document.getElementById("step3-ott"),
  "3-food": document.getElementById("step3-food"),
  "4-food": document.getElementById("step4-food")
};

const navArea = document.getElementById("navArea");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");

// 버튼 이벤트 등록 (현재 페이지에 있는 버튼만 작동)
document.querySelectorAll(".option-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.key;
    const value = button.dataset.value;

    // 이미 선택된 버튼을 다시 누르면 선택 해제
    if (button.classList.contains("selected")) {
      button.classList.remove("selected");

      if (key) {
        state[key] = "";
      }

      // 1단계 선택을 취소하면 다음 버튼 숨기기
      if (state.currentStep === 1 && navArea && progressBar) {
        navArea.classList.add("hidden");
        progressBar.style.display = "none";
      }

      return;
    }

    // 같은 선택 그룹 찾기
    // 일반 버튼은 .option-group, OTT 로고 카드는 .ott-logo-grid 사용
    const parent = button.closest(".option-group, .ott-logo-grid");

    if (parent) {
      parent.querySelectorAll(".option-btn").forEach((btn) => {
        btn.classList.remove("selected");
      });
    }

    // 새 버튼 선택
    button.classList.add("selected");

    if (key) {
      state[key] = value;
    }

    // 1단계 선택 시 네비게이션과 프로그레스 바 표시
    if (state.currentStep === 1 && navArea && progressBar) {
      navArea.classList.remove("hidden");
      progressBar.style.display = "block";
    }
  });
});

// 다음 단계 버튼 이벤트 바인딩
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (state.currentStep === 1 && !state.primary) {
      showCustomAlert("기준을 선택해주세요.");
      return;
    }

    if (state.currentStep === 2 && !state.situation) {
      showCustomAlert("현재 상황을 선택해주세요.");
      return;
    }

    if (state.currentStep === 3 && state.primary === "ott" && !state.detail) {
      showCustomAlert("OTT를 선택해주세요.");
      return;
    }

    if (state.currentStep === 3 && state.primary === "food" && !state.ott) {
      showCustomAlert("OTT를 선택해주세요.");
      return;
    }

    if (state.currentStep === 4 && state.primary === "food" && !state.detail) {
      showCustomAlert("음식 종류를 선택해주세요.");
      return;
    }

    if (state.currentStep === 1) {
      state.currentStep = 2;
      updateUI();
      return;
    }

    if (state.currentStep === 2) {
      state.currentStep = 3;
      updateUI();
      return;
    }

    if (state.currentStep === 3 && state.primary === "food") {
      state.currentStep = 4;
      updateUI();
      return;
    }

    const ottUrlMap = {
      "넷플릭스": "netflix",
      "디즈니+": "disney",
      "티빙": "tving",
      "웨이브": "wavve"
    };

    let selectedOttName = "";

    if (state.primary === "ott") {
      selectedOttName = state.detail;
    }

    if (state.primary === "food") {
      selectedOttName = state.ott;
    }

    const ottParam = ottUrlMap[selectedOttName];

    if (!ottParam) {
      showCustomAlert("올바른 OTT를 선택해주세요.");
      return;
    }

    const mealParam = encodeURIComponent(state.situation);
    const foodParam = encodeURIComponent(state.detail);

    window.location.href = `movie.html?ott=${ottParam}&meal=${mealParam}&food=${foodParam}`;
  });
}


if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateUI();
    }
  });
}

// UI 업데이트 로직 (마법사 폼 연출)
function updateUI() {
  document.querySelectorAll(".step-section").forEach(el => {
    el.classList.remove("active", "hidden");
    el.classList.add("hidden");
  });

  const totalStep = state.primary === "food" ? 4 : 3;

  if (progressFill) {
    progressFill.style.width = `${(state.currentStep / totalStep) * 100}%`;
  }

  if (state.currentStep === 1) {
    if (navArea) navArea.classList.add("hidden");

    if (steps[1]) {
      steps[1].classList.remove("hidden");
      steps[1].classList.add("active");
    }

    if (nextBtn) {
      nextBtn.textContent = "다음 단계";
    }
  }

  else if (state.currentStep === 2) {
    if (navArea) navArea.classList.remove("hidden");

    if (steps[2]) {
      steps[2].classList.remove("hidden");
      steps[2].classList.add("active");
    }

    if (nextBtn) {
      nextBtn.textContent = "다음 단계";
    }
  }

  else if (state.currentStep === 3) {
    if (navArea) navArea.classList.remove("hidden");

    if (state.primary === "ott" && steps["3-ott"]) {
      steps["3-ott"].classList.remove("hidden");
      steps["3-ott"].classList.add("active");

      if (nextBtn) {
        nextBtn.textContent = "추천 영화 보러가기";
      }
    }

    else if (state.primary === "food" && steps["3-food"]) {
      steps["3-food"].classList.remove("hidden");
      steps["3-food"].classList.add("active");

      if (nextBtn) {
        nextBtn.textContent = "음식 선택하러 가기";
      }
    }
  }

  else if (state.currentStep === 4) {
    if (navArea) navArea.classList.remove("hidden");

    if (steps["4-food"]) {
      steps["4-food"].classList.remove("hidden");
      steps["4-food"].classList.add("active");
    }

    if (nextBtn) {
      nextBtn.textContent = "추천 영화 보러가기";
    }
  }
}

// 결과 처리 및 API 통신 뼈대 구현
async function showResult() {
  const wizardForm = document.getElementById("wizardForm");
  if (wizardForm) wizardForm.querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
  
  const loadingSection = document.getElementById("loadingSection");
  const resultSection = document.getElementById("resultSection");
  
  if (loadingSection) loadingSection.classList.remove("hidden");

  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // 지연 응답 시뮬레이션
    
    const data = {
      ottTitle: state.primary === "ott" ? state.detail : "추천 OTT 콘텐츠",
      ottGenre: `${state.situation}에 어울리는 추천 장르`,
      foodName: state.primary === "food" ? state.detail : "피자 또는 치킨",
      foodReason: `${state.situation} 상황에 완벽하게 어울리는 조합입니다.`,
      bestMatchCombo: `현재 상황(${state.situation})을 고려하여, 최적의 조합을 추천합니다!`
    };

    const contentResult = document.getElementById("contentResult");
    if (contentResult) {
      contentResult.innerHTML = `<div class="result-item"><strong>📺 ${data.ottTitle}</strong><p>장르/특징: ${data.ottGenre}</p></div>`;
    }

    const foodResult = document.getElementById("foodResult");
    if (foodResult) {
      foodResult.innerHTML = `<div class="result-item"><strong>🍽️ ${data.foodName}</strong><p>${data.foodReason}</p></div>`;
    }

    const bestMatchText = document.getElementById("bestMatchText");
    if (bestMatchText) bestMatchText.textContent = data.bestMatchCombo;

    if (loadingSection) loadingSection.classList.add("hidden");
    if (resultSection) resultSection.classList.remove("hidden");

  } catch (error) {
    console.error('오류 발생:', error);
    if (loadingSection) loadingSection.classList.add("hidden");
    showCustomAlert("결과를 불러오는 중 문제가 발생했습니다.");
    setTimeout(() => location.reload(), 2000);
  }
}

// 초기화 버튼 이벤트 처리
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.addEventListener("click", () => location.reload());

// 클립보드 기반 공유 로직
const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    let ottText = state.primary === "ott" ? state.detail : "추천 OTT";
    let foodText = state.primary === "food" ? state.detail : "추천 음식";
    const shareText = `🍿 뭐 볼까, 뭐 먹을까 🍕\n\n[나의 선택]\n✨ 상황: ${state.situation}\n\n[추천 결과]\n📺 콘텐츠: ${ottText}\n🍽️ 음식: ${foodText}\n\n우리 이거 같이 볼래? 👀`;

    navigator.clipboard.writeText(shareText).then(() => {
      showCustomAlert("추천 결과가 복사되었습니다!");
    });
  });
}

// --- 다크 모드 토글 로직 ---
const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;

// --- 설정 팝업 열기/닫기 로직 ---
const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");

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
  body.classList.add("dark-mode");
  if (darkModeToggle) darkModeToggle.textContent = "☀️ 라이트 모드";
}

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

// --- 커스텀 경고창(Toast) 처리 함수 ---
function showCustomAlert(message) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "custom-toast";
  toast.innerHTML = `<span>⚠️</span> ${message}`;

  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}