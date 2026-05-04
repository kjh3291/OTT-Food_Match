// 1. 상태 관리 객체 (현재 어느 단계인지, 무엇을 선택했는지 저장)
const state = {
  currentStep: 1,
  primary: "",   // 'ott' 또는 'food'
  situation: "", // '혼밥', '야식' 등
  detail: ""     // '넷플릭스', '치킨/피자' 등
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

// 버튼 이벤트 등록
document.querySelectorAll(".option-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    const step = button.dataset.step;
    const key = button.dataset.key;
    const value = button.dataset.value;

    // 데이터 저장
    state[key] = value;

    // 시각적 활성화 처리 (같은 그룹 내 다른 버튼 선택 해제)
    const parent = button.closest(".option-group");
    parent.querySelectorAll(".option-btn").forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");

    // 1단계 선택 시 네비게이션과 프로그레스 바 표시
    if (state.currentStep === 1) {
      navArea.classList.remove("hidden");
      progressBar.style.display = "block";
    }
  });
});

// 다음 단계 버튼
nextBtn.addEventListener("click", () => {
  // 예외 처리: 현재 단계에서 선택을 안 하고 넘어가려 할 때
  if (state.currentStep === 1 && !state.primary) return alert("기준을 선택해주세요.");
  if (state.currentStep === 2 && !state.situation) return alert("상황을 선택해주세요.");
  if (state.currentStep === 3 && !state.detail) return alert("상세 항목을 선택해주세요.");

  if (state.currentStep < 3) {
    state.currentStep++;
    updateUI();
  } else {
    // 마지막 3단계에서 다음을 누르면 결과 표시
    showResult();
  }
});

// 이전 단계 버튼
prevBtn.addEventListener("click", () => {
  if (state.currentStep > 1) {
    state.currentStep--;
    updateUI();
  }
});

// UI 업데이트 함수 (화면 전환 및 프로그레스 바 조절)
function updateUI() {
  // 모든 섹션 숨기기
  document.querySelectorAll(".step-section").forEach(el => el.classList.remove("active", "hidden"));
  document.querySelectorAll(".step-section").forEach(el => el.classList.add("hidden"));

  // 진행률 바 업데이트 (3단계 기준)
  progressFill.style.width = `${(state.currentStep / 3) * 100}%`;

  // 이전/다음 버튼 텍스트 변경
  if (state.currentStep === 1) {
    navArea.classList.add("hidden"); // 1단계는 버튼 선택 즉시 활성화되므로 숨김
    steps[1].classList.remove("hidden");
    steps[1].classList.add("active");
  } else if (state.currentStep === 2) {
    navArea.classList.remove("hidden");
    steps[2].classList.remove("hidden");
    steps[2].classList.add("active");
    nextBtn.textContent = "다음 단계";
  } else if (state.currentStep === 3) {
    nextBtn.textContent = "추천 결과 보기 ✨";
    // 1단계에서 무엇을 골랐는지에 따라 분기
    if (state.primary === "ott") {
      steps["3-ott"].classList.remove("hidden");
      steps["3-ott"].classList.add("active");
    } else {
      steps["3-food"].classList.remove("hidden");
      steps["3-food"].classList.add("active");
    }
  }
}

// 결과 생성 및 렌더링
function showResult() {
  // 입력된 항목들을 모두 숨김
  document.getElementById("wizardForm").querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
  
  const contentResult = document.getElementById("contentResult");
  const foodResult = document.getElementById("foodResult");
  const bestMatchText = document.getElementById("bestMatchText");

  // 동적 결과 텍스트 생성 로직
  let ottText = state.primary === "ott" ? state.detail : "넷플릭스/티빙";
  let foodText = state.primary === "food" ? state.detail : "피자 또는 치킨";
  
  // 상황에 따른 부가 설명
  let reason = `${state.situation} 상황에 완벽하게 어울리는 조합입니다.`;
  if (state.situation === "야식") reason = "밤에 즐기면 두 배로 맛있는 야식 특화 추천입니다.";
  else if (state.situation === "혼밥") reason = "방해받지 않고 오롯이 나만의 시간을 즐길 수 있는 추천입니다.";

  contentResult.innerHTML = `
    <div class="result-item">
      <strong>📺 ${ottText} 인기 콘텐츠</strong>
      <p>장르: ${state.situation}에 어울리는 추천 장르</p>
    </div>
  `;

  foodResult.innerHTML = `
    <div class="result-item">
      <strong>🍽️ ${foodText}</strong>
      <p>${reason}</p>
    </div>
  `;

  bestMatchText.textContent = `현재 상황(${state.situation})을 고려하여, ${ottText} 시청 시 ${foodText} 메뉴를 곁들이는 것을 가장 강력하게 추천합니다!`;

  document.getElementById("resultSection").classList.remove("hidden");
}

// 초기화 버튼
document.getElementById("resetBtn").addEventListener("click", () => {
  location.reload(); // 가장 깔끔한 초기화 방법 (새로고침)
});

// 공유하기 기능
document.getElementById("shareBtn").addEventListener("click", () => {
  let ottText = state.primary === "ott" ? state.detail : "추천 OTT";
  let foodText = state.primary === "food" ? state.detail : "추천 음식";
  
  const shareText = `🍿 뭐 볼까, 뭐 먹을까 🍕\n\n[나의 선택]\n✨ 상황: ${state.situation}\n\n[추천 결과]\n📺 콘텐츠: ${ottText}\n🍽️ 음식: ${foodText}\n\n우리 이거 같이 볼래? 👀`;

  navigator.clipboard.writeText(shareText).then(() => {
    alert("추천 결과가 복사되었습니다!");
  });
});