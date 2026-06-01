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
  const prevBtn = document.getElementById("prevBtn"); // 복구됨
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

  // 💡 복구된 기능: 이전 버튼 클릭 처리
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (state.currentStep > 1) {
        state.currentStep--;
        updateUI();
      }
    });
  }

  // 💡 복구 및 강화된 UI 업데이트 로직 (화면 숨김/표시 완벽 제어)
  function updateUI() {
    // 먼저 모든 섹션을 숨김 (active 제거, hidden 추가)
    Object.values(steps).forEach(el => {
      if(el) {
        el.classList.remove("active");
        el.classList.add("hidden");
      }
    });
    
    const maxSteps = state.primary === "food" ? 4 : 3;
    if (progressFill) progressFill.style.width = `${(state.currentStep / maxSteps) * 100}%`;

    const activeStep = state.currentStep === 3 ? (state.primary === "ott" ? "3-ott" : "3-food") : state.currentStep;
    
    // 현재 단계의 섹션 보이기 (hidden 제거, active 추가)
    if (steps[activeStep]) {
      steps[activeStep].classList.remove("hidden");
      steps[activeStep].classList.add("active");
    }
    
    // 네비게이션(이전/다음) 영역 처리
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

  // 결과 처리 함수
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
      
      const ottName = state.primary === "ott" ? state.detail : state.selectedOtt;

      const data = {
        ottTitle: lang === "ko" ? `${ottName} 추천 콘텐츠` : `Recommended on ${ottName}`,
        ottGenre: lang === "ko" ? `${state.situation}에 어울리는 추천 장르` : `Genres for ${mealInLang}`,
        foodName: state.primary === "food" ? state.detail : (lang === "ko" ? "피자 또는 치킨" : "Pizza or Chicken"),
        foodReason: lang === "ko" ? `${state.situation} 상황에 완벽하게 어울리는 조합입니다.` : `Perfect pairing for ${mealInLang}.`,
        bestMatchCombo: lang === "ko" ? `현재 상황(${state.situation})을 고려하여 최적의 조합을 추천합니다!` : `Considering your setting (${mealInLang}), we recommend this combo!`
      };

      if (document.getElementById("contentResult")) document.getElementById("contentResult").innerHTML = `<div class="result-item"><strong>📺 ${data.ottTitle}</strong><p>${lang === 'ko' ? '장르/특징' : 'Genre/Info'}: ${data.ottGenre}</p></div>`;
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
     if (darkModeToggle) darkModeToggle.textContent = getLang() === "ko" ? "☀️ 라이트 모드" : "☀️ Light Mode";
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


  const editSavedComboBtn = document.getElementById("editSavedComboBtn");
  const savedManageModal = document.getElementById("savedManageModal");
  const closeSavedManageModal = document.getElementById("closeSavedManageModal");
  const savedManageDoneBtn = document.getElementById("savedManageDoneBtn");
  const savedManageList = document.getElementById("savedManageList");


    // ===============================
  // 최근 저장한 조합 메인 화면 표시
  // ===============================

    if (editSavedComboBtn) {
    editSavedComboBtn.addEventListener("click", () => {
      openSavedManageModal();
    });
  }

  if (closeSavedManageModal) {
    closeSavedManageModal.addEventListener("click", () => {
      closeSavedManageModalFn();
    });
  }

  if (savedManageDoneBtn) {
    savedManageDoneBtn.addEventListener("click", () => {
      closeSavedManageModalFn();
    });
  }

  if (savedManageModal) {
    savedManageModal.addEventListener("click", (event) => {
      if (event.target === savedManageModal) {
        closeSavedManageModalFn();
      }
    });
  }

  function renderSavedCombosOnMain() {
    const savedComboList = document.getElementById("savedComboList");

    if (!savedComboList) return;

    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    const recentCombos = savedCombos.slice(-3).reverse();

    if (recentCombos.length === 0) {
      savedComboList.innerHTML = `
        <div class="saved-empty-card">
          <div class="saved-empty-icon">🍿</div>
          <h3>아직 저장한 조합이 없어요</h3>
          <p>영화 상세 페이지에서 마음에 드는 조합을 저장하면 이곳에 표시됩니다.</p>
        </div>
      `;
      return;
    }

    savedComboList.innerHTML = recentCombos
  .map((combo) => {
    const posterUrl = combo.posterPath
      ? `https://image.tmdb.org/t/p/w200${combo.posterPath}`
      : "";

    return `
      <div 
        class="saved-mini-card"
        data-movie-id="${combo.movieId}"
        data-ott="${combo.ott}"
        data-meal="${combo.meal}"
        data-genre="${combo.genre}"
      >
        <div class="saved-mini-poster-box">
          ${
            posterUrl
              ? `<img src="${posterUrl}" alt="${combo.movieTitle} 포스터" class="saved-mini-poster">`
              : `<div class="saved-mini-no-poster">포스터 없음</div>`
          }
        </div>

        <div class="saved-mini-food">
          <span>🍽</span>
          <strong>${combo.foodName}</strong>
        </div>
      </div>
    `;
  })
  .join("");

addSavedMiniCardEvents();
  }

    function openSavedManageModal() {
    if (!savedManageModal) return;

    renderSavedManageList();
    savedManageModal.classList.add("show");
  }

  function closeSavedManageModalFn() {
    if (!savedManageModal) return;

    savedManageModal.classList.remove("show");
  }

    function renderSavedManageList() {
    if (!savedManageList) return;

    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];

    if (savedCombos.length === 0) {
      savedManageList.innerHTML = `
        <div class="saved-manage-empty">
          <p>저장된 조합이 없습니다.</p>
        </div>
      `;
      return;
    }

    const recentCombos = [...savedCombos].reverse();

    savedManageList.innerHTML = recentCombos
      .map((combo) => {
        const posterUrl = combo.posterPath
          ? `https://image.tmdb.org/t/p/w200${combo.posterPath}`
          : "";

        return `
          <div class="saved-manage-item">
            <div class="saved-manage-poster-box">
              ${
                posterUrl
                  ? `<img src="${posterUrl}" alt="${combo.movieTitle} 포스터" class="saved-manage-poster">`
                  : `<div class="saved-manage-no-poster">포스터 없음</div>`
              }
            </div>

            <div class="saved-manage-info">
              <strong>${combo.movieTitle}</strong>
              <p>🍽 ${combo.foodName}</p>
            </div>

            <button 
              class="saved-remove-btn"
              data-movie-id="${combo.movieId}"
              data-food-name="${combo.foodName}"
            >
              저장 취소
            </button>
          </div>
        `;
      })
      .join("");

    addSavedRemoveEvents();
  }


    function addSavedRemoveEvents() {
    document.querySelectorAll(".saved-remove-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const movieId = Number(button.dataset.movieId);
        const foodName = button.dataset.foodName;

        const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];

        const filteredCombos = savedCombos.filter((combo) => {
          return !(combo.movieId === movieId && combo.foodName === foodName);
        });

        localStorage.setItem("savedCombos", JSON.stringify(filteredCombos));

        showCustomAlert("저장한 조합이 삭제되었습니다.");

        renderSavedCombosOnMain();
        renderSavedManageList();
      });
    });
  }

  function getOttDisplayName(ottKey) {
    const ottNameMap = {
      netflix: "넷플릭스",
      disney: "디즈니+",
      tving: "티빙",
      wavve: "웨이브",
    };

    return ottNameMap[ottKey] || "OTT";
  }

  function addSavedMiniCardEvents() {
  document.querySelectorAll(".saved-mini-card").forEach((card) => {
    card.addEventListener("click", () => {
      const movieId = card.dataset.movieId;
      const ott = card.dataset.ott;
      const meal = encodeURIComponent(card.dataset.meal);
      const genre = encodeURIComponent(card.dataset.genre);

      window.location.href =
        `recommend.html?movieId=${movieId}` +
        `&ott=${ott}` +
        `&meal=${meal}` +
        `&genre=${genre}`;
    });
  });
}

  renderSavedCombosOnMain();

});