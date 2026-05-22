// 1. 상태 관리 객체
const state = { currentStep: 1, primary: "", situation: "", detail: "", selectedOtt: "" };

const steps = { 
  1: document.getElementById("step1"), 
  2: document.getElementById("step2"), 
  "3-ott": document.getElementById("step3-ott"), 
  "3-food": document.getElementById("step3-food"), 
  4: document.getElementById("step4-ott") 
};

const navArea = document.getElementById("navArea");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");

function getMealKey(situation) {
  const map = { "혼밥": "honbab", "야식": "yasik", "친구와 함께": "friends", "연인과 함께": "couple", "간단한 식사": "light", "든든한 식사": "heavy" };
  return map[situation] || "honbab";
}

document.querySelectorAll(".option-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.key;
    const value = button.dataset.value;

    // 이미 선택된 버튼을 다시 누르면 선택 해제
    if (button.classList.contains("selected")) {
      button.classList.remove("selected");
      if (key) state[key] = "";
      if (state.currentStep === 1 && navArea) {
        navArea.classList.add("hidden");
        if (progressBar) progressBar.style.display = "none";
      }
      return;
    }

    const parent = button.closest(".option-group, .ott-logo-grid");
    if (parent) parent.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));

    button.classList.add("selected");
    if (key) state[key] = value;

    // 1단계 선택 시 버튼과 프로그레스 바 표시 복구
    if (state.currentStep === 1 && navArea) {
      navArea.classList.remove("hidden");
      if (progressBar) progressBar.style.display = "block";
    }
  });
});

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (state.currentStep === 1 && !state.primary) return showCustomAlert(t("alert_primary"));
    if (state.currentStep === 2 && !state.situation) return showCustomAlert(t("alert_situation"));
    if (state.currentStep === 3 && !state.detail) return showCustomAlert(t("alert_detail"));
    if (state.currentStep === 4 && !state.selectedOtt) return showCustomAlert(t("alert_ott"));

    const maxSteps = state.primary === "food" ? 4 : 3;
    if (state.currentStep < maxSteps) {
      state.currentStep++;
      updateUI();
      return;
    }

    if (state.primary === "ott") {
      const ottUrlMap = { "넷플릭스": "netflix", "디즈니+": "disney", "티빙": "tving", "웨이브": "wavve" };
      window.location.href = `movie.html?ott=${ottUrlMap[state.detail]}&meal=${encodeURIComponent(state.situation)}`;
      return;
    }
    showResult();
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

function updateUI() {
  document.querySelectorAll(".step-section").forEach(el => {
    el.classList.remove("active");
    el.classList.add("hidden");
  });

  const maxSteps = state.primary === "food" ? 4 : 3;
  if (progressFill) progressFill.style.width = `${(state.currentStep / maxSteps) * 100}%`;

  // 각 단계에 맞게 화면을 띄울 때 'hidden'을 지우고 'active'를 추가하도록 복원
  if (state.currentStep === 1) {
    if (navArea) navArea.classList.add("hidden");
    if (steps[1]) { steps[1].classList.remove("hidden"); steps[1].classList.add("active"); }
  } else if (state.currentStep === 2) {
    if (navArea) navArea.classList.remove("hidden");
    if (steps[2]) { steps[2].classList.remove("hidden"); steps[2].classList.add("active"); }
    if (nextBtn) nextBtn.textContent = t("nextBtn");
  } else if (state.currentStep === 3) {
    if (state.primary === "ott") {
      if (nextBtn) nextBtn.textContent = t("nextBtnResult");
      if (steps["3-ott"]) { steps["3-ott"].classList.remove("hidden"); steps["3-ott"].classList.add("active"); }
    } else {
      if (nextBtn) nextBtn.textContent = t("nextBtn");
      if (steps["3-food"]) { steps["3-food"].classList.remove("hidden"); steps["3-food"].classList.add("active"); }
    }
  } else if (state.currentStep === 4) {
    if (nextBtn) nextBtn.textContent = t("nextBtnResult");
    if (steps[4]) { steps[4].classList.remove("hidden"); steps[4].classList.add("active"); }
  }
}

// 🌐 i18n 언어 변경 이벤트 수신 시 UI(버튼 텍스트 등) 리렌더링
document.addEventListener("languageChanged", updateUI);

async function showResult() {
  const wizardForm = document.getElementById("wizardForm");
  if (wizardForm) wizardForm.querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
  
  const loadingSection = document.getElementById("loadingSection");
  const resultSection = document.getElementById("resultSection");
  if (loadingSection) loadingSection.classList.remove("hidden");

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const lang = getLang();
    const mealKey = getMealKey(state.situation);
    const mealInLang = t("meal_" + mealKey);
    const ottName = state.primary === "ott" ? state.detail : state.selectedOtt;

    const data = {
      ottTitle: lang === "ko" ? `${ottName} 추천 콘텐츠` : `Recommended on ${ottName}`,
      ottGenre: lang === "ko" ? `${state.situation}에 어울리는 추천 장르` : `Genres for ${mealInLang}`,
      foodName: state.primary === "food" ? state.detail : (lang === "ko" ? "피자 또는 치킨" : "Pizza or Chicken"),
      foodReason: lang === "ko" ? `${state.situation} 상황에 완벽하게 어울리는 조합입니다.` : `Perfect pairing for ${mealInLang}.`,
      bestMatchCombo: lang === "ko" ? `현재 상황(${state.situation})을 고려하여 최적의 조합을 추천합니다!` : `Considering your setting (${mealInLang}), we recommend this combo!`
    };

    if (document.getElementById("contentResult")) document.getElementById("contentResult").innerHTML = `<div class="result-item"><strong>📺 ${data.ottTitle}</strong><p>${lang === 'ko' ? '장르/특징' : 'Genre/Info'}: ${data.ottGenre}</p></div>`;
    if (document.getElementById("foodResult")) document.getElementById("foodResult").innerHTML = `<div class="result-item"><strong>🍽️ ${data.foodName}</strong><p>${data