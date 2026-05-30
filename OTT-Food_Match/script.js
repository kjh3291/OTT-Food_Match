document.addEventListener("DOMContentLoaded", () => {
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

  // 버튼 이벤트 등록
  document.querySelectorAll(".option-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      const value = button.dataset.value;

      if (button.classList.contains("selected")) {
        button.classList.remove("selected");
        if (key) state[key] = "";
        if (state.currentStep === 1 && navArea) navArea.classList.add("hidden");
        return;
      }

      const parent = button.closest(".option-group, .ott-logo-grid");
      if (parent) parent.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));

      button.classList.add("selected");
      if (key) state[key] = value;

      if (state.currentStep === 1 && navArea) navArea.classList.remove("hidden");
    });
  });

  // 다음 버튼 클릭 처리
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
      } else {
        if (state.primary === "ott") {
           const ottUrlMap = { "넷플릭스": "netflix", "디즈니+": "disney", "티빙": "tving", "웨이브": "wavve" };
           window.location.href = `movie.html?ott=${ottUrlMap[state.detail]}&meal=${encodeURIComponent(state.situation)}`;
        } else {
           showResult();
        }
      }
    });
  }

  // 이전 버튼 클릭 처리
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
    Object.values(steps).forEach(el => {
      if(el) {
        el.classList.remove("active");
        el.classList.add("hidden");
      }
    });
    
    const maxSteps = state.primary === "food" ? 4 : 3;
    if (progressFill) progressFill.style.width = `${(state.currentStep / maxSteps) * 100}%`;

    const activeStep = state.currentStep === 3 ? (state.primary === "ott" ? "3-ott" : "3-food") : state.currentStep;
    
    if (steps[activeStep]) {
      steps[activeStep].classList.remove("hidden");
      steps[activeStep].classList.add("active");
    }
    
    if (state.currentStep === 1) {
      if (navArea) {
        if (state.primary) navArea.classList.remove("hidden");
        else navArea.classList.add("hidden");
      }
    } else {
      if (navArea) navArea.classList.remove("hidden");
    }

    if (nextBtn) nextBtn.textContent = (state.currentStep === maxSteps) ? t("nextBtnResult") : t("nextBtn");
  }

  // 💡 결과 처리 함수 (중국어 완벽 지원 패치)
  async function showResult() {
    const wizardForm = document.getElementById("wizardForm");
    if (wizardForm) wizardForm.querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
    
    const loadingSection = document.getElementById("loadingSection");
    const resultSection = document.getElementById("resultSection");
    if (loadingSection) loadingSection.classList.remove("hidden");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const lang = getLang();
      
      const mapSituation = { "혼밥": "honbab", "야식": "yasik", "친구와 함께": "friends", "연인과 함께": "couple", "간단한 식사": "light", "든든한 식사": "heavy" };
      const mealKey = mapSituation[state.situation] || "honbab";
      const mealInLang = t("meal_" + mealKey);
      
      const rawOttName = state.primary === "ott" ? state.detail : state.selectedOtt;
      
      // OTT 이름 번역 변환
      const ottMapEn = { "넷플릭스": "Netflix", "디즈니+": "Disney+", "티빙": "TVING", "웨이브": "wavve" };
      const ottMapZh = { "넷플릭스": "网飞", "디즈니+": "迪士尼+", "티빙": "TVING", "웨이브": "wavve" };
      const ottName = lang === "ko" ? rawOttName : (lang === "en" ? (ottMapEn[rawOttName] || rawOttName) : (ottMapZh[rawOttName] || rawOttName));

      // 선택한 음식 메뉴 번역 변환
      const foodMap = { "치킨/피자": "food_chicken_pizza", "분식(떡볶이 등)": "food_bunsik", "한식(국밥/찌개)": "food_korean", "양식(파스타 등)": "food_western" };
      const translatedFood = state.primary === "food" ? t(foodMap[state.detail] || state.detail) : null;

      let data = {};
      
      if (lang === "ko") {
        data.ottTitle = `${ottName} 추천 콘텐츠`;
        data.ottGenre = `${state.situation}에 어울리는 추천 장르`;
        data.foodName = translatedFood || "피자 또는 치킨";
        data.foodReason = `${state.situation} 상황에 완벽하게 어울리는 조합입니다.`;
        data.bestMatchCombo = `현재 상황(${state.situation})을 고려하여 최적의 조합을 추천합니다!`;
        data.genreLabel = "장르/특징";
      } else if (lang === "zh") {
        data.ottTitle = `${ottName} 推荐内容`;
        data.ottGenre = `适合 ${mealInLang} 的推荐类型`;
        data.foodName = translatedFood || "披萨 或 炸鸡";
        data.foodReason = `完美契合 ${mealInLang} 场景的绝佳搭配。`;
        data.bestMatchCombo = `考虑到您当前的场景（${mealInLang}），我们为您推荐此最佳组合！`;
        data.genreLabel = "类型/特点";
      } else {
        data.ottTitle = `Recommended on ${ottName}`;
        data.ottGenre = `Genres for ${mealInLang}`;
        data.foodName = translatedFood || "Pizza or Chicken";
        data.foodReason = `Perfect pairing for ${mealInLang}.`;
        data.bestMatchCombo = `Considering your setting (${mealInLang}), we recommend this combo!`;
        data.genreLabel = "Genre/Info";
      }

      if (document.getElementById("contentResult")) document.getElementById("contentResult").innerHTML = `<div class="result-item"><strong>📺 ${data.ottTitle}</strong><p>${data.genreLabel}: ${data.ottGenre}</p></div>`;
      if (document.getElementById("foodResult")) document.getElementById("foodResult").innerHTML = `<div class="result-item"><strong>🍽️ ${data.foodName}</strong><p>${data.foodReason}</p></div>`;
      if (document.getElementById("bestMatchText")) document.getElementById("bestMatchText").textContent = data.bestMatchCombo;

      if (loadingSection) loadingSection.classList.add("hidden");
      if (resultSection) resultSection.classList.remove("hidden");

    } catch (error) {
      if (loadingSection) loadingSection.classList.add("hidden");
      showCustomAlert(t("alert_error"));
      setTimeout(() => location.reload(), 2000);
    }
  }

  // 초기화 및 공유 기능
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", () => location.reload());

  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const resultSection = shareBtn.closest(".result-section");
      if (!resultSection) return;
      const actionArea = resultSection.querySelector(".action-area");
      if (actionArea) actionArea.style.display = "none";

      try {
        const canvas = await html2canvas(resultSection, { scale: 2, backgroundColor: document.body.classList.contains("dark-mode") ? "#222222" : "#ffffff", logging: false, useCORS: true });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = getLang() === "ko" ? "맞춤_추천결과.png" : "Recommendation_Result.png";
        link.click();
        showCustomAlert(t("alert_copied"));
      } catch (error) {
        showCustomAlert(t("alert_error"));
      } finally {
        if (actionArea) actionArea.style.display = "flex";
      }
    });
  }

  // 설정 팝업 제어
  const settingBtn = document.getElementById("settingBtn");
  const settingPopup = document.getElementById("settingPopup");
  if (settingBtn && settingPopup) {
    settingBtn.addEventListener("click", (e) => { e.stopPropagation(); settingPopup.classList.toggle("hidden"); });
    document.addEventListener("click", () => settingPopup.classList.add("hidden"));
    settingPopup.addEventListener("click", (e) => e.stopPropagation());
  }

  // 다크모드 제어
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (localStorage.getItem("theme") === "dark") {
     document.body.classList.add("dark-mode");
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
      document.dispatchEvent(new Event("languageChanged")); 
    });
  }

  document.addEventListener("languageChanged", updateUI);

  // 커스텀 토스트 알림창
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
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 2500);
  }
});

