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
// [기존 코드 유지] 상태 관리 객체, 버튼 이벤트 등록, 다음/이전 버튼 이벤트 등...

// --- 변경된 결과 생성 및 API 연동 로직 ---
async function showResult() {
  // 1. 입력 폼 숨기고 로딩 화면 띄우기
  document.getElementById("wizardForm").querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
  const loadingSection = document.getElementById("loadingSection");
  const resultSection = document.getElementById("resultSection");
  
  loadingSection.classList.remove("hidden");

  // 2. 서버로 보낼 사용자 선택 데이터 정리
  const requestData = {
    primaryChoice: state.primary, // 'ott' 또는 'food'
    situation: state.situation,
    detailChoice: state.detail
  };

  try {
    /* // 🚧 [실제 API 연동 시 사용할 코드] 🚧
    // 'YOUR_API_ENDPOINT_URL' 부분에 실제 서버 주소를 넣으세요.
    const response = await fetch('YOUR_API_ENDPOINT_URL', {
      method: 'POST', // 또는 GET (API 설계에 따라 다름)
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) throw new Error('API 호출에 실패했습니다.');
    const data = await response.json(); 
    */

    // ⏳ [현재 테스트를 위한 가짜 API 지연(1.5초) 코드] - 실제 연동 시 지워주세요!
    await new Promise(resolve => setTimeout(resolve, 1500));
    const data = {
      ottTitle: state.primary === "ott" ? state.detail : "넷플릭스 오리지널",
      ottGenre: `${state.situation}에 어울리는 추천 장르`,
      foodName: state.primary === "food" ? state.detail : "피자 또는 치킨",
      foodReason: `${state.situation} 상황에 완벽하게 어울리는 조합입니다.`,
      bestMatchCombo: `현재 상황(${state.situation})을 고려하여, 최적의 메뉴와 콘텐츠를 추천합니다!`
    };
    // -------------------------------------------------------------

    // 3. API 응답 데이터(data)를 바탕으로 화면 렌더링
    document.getElementById("contentResult").innerHTML = `
      <div class="result-item">
        <strong>📺 ${data.ottTitle}</strong>
        <p>장르/특징: ${data.ottGenre}</p>
      </div>
    `;

    document.getElementById("foodResult").innerHTML = `
      <div class="result-item">
        <strong>🍽️ ${data.foodName}</strong>
        <p>${data.foodReason}</p>
      </div>
    `;

    document.getElementById("bestMatchText").textContent = data.bestMatchCombo;

    // 4. 로딩 화면 숨기고 결과 화면 보여주기
    loadingSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

  } catch (error) {
    // API 에러 처리
    console.error('Error fetching recommendation:', error);
    loadingSection.classList.add("hidden");
    alert("결과를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    location.reload();
  }
}

// [기존 코드 유지] 초기화 버튼, 공유하기 기능 등...

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