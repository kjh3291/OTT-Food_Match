// 1. 상태 관리 객체
const state = {
  currentStep: 1,
  primary: "",
  situation: "",
  detail: ""
};

// HTML 요소 맵핑
const steps = {
  1: document.getElementById("step1"),
  2: document.getElementById("step2"),
  "3-ott": document.getElementById("step3-ott"),
  "3-food": document.getElementById("step3-food")
};

const navArea = document.getElementById("navArea");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");

// 버튼 이벤트 등록 (현재 페이지에 있는 버튼만 작동)
document.querySelectorAll(".option-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = button.dataset.key;
    const value = button.dataset.value;

    if (key) state[key] = value;

    const parent = button.closest(".option-group");
    if (parent) {
      parent.querySelectorAll(".option-btn").forEach((btn) => btn.classList.remove("selected"));
    }
    button.classList.add("selected");

    if (state.currentStep === 1 && navArea && progressBar) {
      navArea.classList.remove("hidden");
      progressBar.style.display = "block";
    }
  });
});

// 다음 단계 버튼
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    // 아무것도 선택하지 않았을 때 커스텀 경고창 표시
    if (state.currentStep === 1 && !state.primary) return showCustomAlert("기준을 선택해주세요.");
    if (state.currentStep === 2 && !state.situation) return showCustomAlert("현재 상황을 선택해주세요.");
    if (state.currentStep === 3 && !state.detail) return showCustomAlert("상세 항목을 선택해주세요.");

    if (state.currentStep < 3) {
      state.currentStep++;
      updateUI();
    } else {
      showResult();
    }
  });
}

// 이전 단계 버튼
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateUI();
    }
  });
}

// UI 업데이트 로직
function updateUI() {
  document.querySelectorAll(".step-section").forEach(el => {
    el.classList.remove("active", "hidden");
    el.classList.add("hidden");
  });

  if (progressFill) progressFill.style.width = `${(state.currentStep / 3) * 100}%`;

  if (state.currentStep === 1) {
    if (navArea) navArea.classList.add("hidden");
    if (steps[1]) {
      steps[1].classList.remove("hidden");
      steps[1].classList.add("active");
    }
  } else if (state.currentStep === 2) {
    if (navArea) navArea.classList.remove("hidden");
    if (steps[2]) {
      steps[2].classList.remove("hidden");
      steps[2].classList.add("active");
    }
    if (nextBtn) nextBtn.textContent = "다음 단계";
  } else if (state.currentStep === 3) {
    if (nextBtn) nextBtn.textContent = "추천 결과 보기 ✨";
    
    if (state.primary === "ott" && steps["3-ott"]) {
      steps["3-ott"].classList.remove("hidden");
      steps["3-ott"].classList.add("active");
    } else if (steps["3-food"]) {
      steps["3-food"].classList.remove("hidden");
      steps["3-food"].classList.add("active");
    }
  }
}

// 결과 생성 (로딩 화면 포함)
async function showResult() {
  const wizardForm = document.getElementById("wizardForm");
  if (wizardForm) wizardForm.querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
  
  const loadingSection = document.getElementById("loadingSection");
  const resultSection = document.getElementById("resultSection");
  
  if (loadingSection) loadingSection.classList.remove("hidden");

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
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

// 초기화 버튼
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.addEventListener("click", () => location.reload());

// 공유하기 버튼 (커스텀 경고창 연동)
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

// --- 커스텀 경고창(Toast) 함수 ---
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