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

  function updateProgress(step) {
    if (progressBar && progressFill) {
      progressBar.style.display = "block";
      const totalSteps = state.primary === "ott" ? 3 : 4;
      const percentage = (step / totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  }

  // 다음 단계 버튼
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (state.currentStep === 1) {
        if (!state.primary) return showCustomAlert(typeof t === 'function' ? t("alert_primary") : "기준을 선택해주세요.");
        steps[1].classList.add("hidden");
        steps[1].classList.remove("active");
        steps[2].classList.remove("hidden");
        steps[2].classList.add("active");
        state.currentStep = 2;
        if (prevBtn) prevBtn.style.display = "block";
        updateProgress(2);
      } else if (state.currentStep === 2) {
        if (!state.situation) return showCustomAlert(typeof t === 'function' ? t("alert_situation") : "상황을 선택해주세요.");
        steps[2].classList.add("hidden");
        steps[2].classList.remove("active");
        if (state.primary === "ott") {
          steps["3-ott"].classList.remove("hidden");
          steps["3-ott"].classList.add("active");
          state.currentStep = "3-ott";
        } else {
          steps["3-food"].classList.remove("hidden");
          steps["3-food"].classList.add("active");
          state.currentStep = "3-food";
        }
        updateProgress(3);
      } else if (state.currentStep === "3-ott") {
  if (!state.detail) {
    return showCustomAlert(typeof t === "function" ? t("alert_detail") : "OTT를 선택해주세요.");
  }
  goToMoviePage(state.detail, state.situation);
} 
      else if (state.currentStep === "3-food") {
        if (!state.detail) return showCustomAlert(typeof t === 'function' ? t("alert_detail") : "음식을 선택해주세요.");
        steps["3-food"].classList.add("hidden");
        steps["3-food"].classList.remove("active");
        steps[4].classList.remove("hidden");
        steps[4].classList.add("active");
        state.currentStep = 4;
        updateProgress(4);
      } else if (state.currentStep === 4) {
  if (!state.selectedOtt) {
    return showCustomAlert(typeof t === "function" ? t("alert_ott") : "OTT를 선택해주세요.");
  }

  goToMoviePage(state.selectedOtt, state.situation, state.detail);
}
    });
  }

  // 이전 단계 버튼
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (state.currentStep === 2) {
        steps[2].classList.add("hidden");
        steps[2].classList.remove("active");
        steps[1].classList.remove("hidden");
        steps[1].classList.add("active");
        state.currentStep = 1;
        prevBtn.style.display = "none";
        updateProgress(1);
      } else if (state.currentStep === "3-ott") {
        steps["3-ott"].classList.add("hidden");
        steps["3-ott"].classList.remove("active");
        steps[2].classList.remove("hidden");
        steps[2].classList.add("active");
        state.currentStep = 2;
        updateProgress(2);
      } else if (state.currentStep === "3-food") {
        steps["3-food"].classList.add("hidden");
        steps["3-food"].classList.remove("active");
        steps[2].classList.remove("hidden");
        steps[2].classList.add("active");
        state.currentStep = 2;
        updateProgress(2);
      } else if (state.currentStep === 4) {
        steps[4].classList.add("hidden");
        steps[4].classList.remove("active");
        steps["3-food"].classList.remove("hidden");
        steps["3-food"].classList.add("active");
        state.currentStep = "3-food";
        updateProgress(3);
      }
    });
  }

  // 💡 다국어 지원 결과 도출 함수
  async function showResult() {
    const wizardForm = document.getElementById("wizardForm");
    if (wizardForm) wizardForm.querySelectorAll(".card, #navArea, .progress-bar").forEach(el => el.style.display = 'none');
    
    const loadingSection = document.getElementById("loadingSection");
    const resultSection = document.getElementById("resultSection");
    if (loadingSection) loadingSection.classList.remove("hidden");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const lang = typeof getLang === 'function' ? getLang() : (localStorage.getItem("lang") || "ko");
      
      const mapSituation = { "혼밥": "honbab", "야식": "yasik", "친구와 함께": "friends", "연인과 함께": "couple", "간단한 식사": "light", "든든한 식사": "heavy" };
      const mealKey = mapSituation[state.situation] || "honbab";
      const mealInLang = typeof t === 'function' ? t("meal_" + mealKey) : state.situation;
      
      const rawOttName = state.primary === "ott" ? state.detail : state.selectedOtt;
      
      const ottMapEn = { "넷플릭스": "Netflix", "디즈니+": "Disney+", "티빙": "TVING", "웨이브": "wavve" };
      const ottMapZh = { "넷플릭스": "网飞", "디즈니+": "迪士尼+", "티빙": "TVING", "웨이브": "wavve" };
      const ottMapJa = { "넷플릭스": "Netflix", "디즈니+": "Disney+", "티빙": "TVING", "웨이브": "wavve" };
      const ottName = lang === "ko" ? rawOttName : (lang === "en" ? (ottMapEn[rawOttName] || rawOttName) : (lang === "zh" ? (ottMapZh[rawOttName] || rawOttName) : (ottMapJa[rawOttName] || rawOttName)));

      const foodMap = { "치킨/피자": "food_chicken_pizza", "분식(떡볶이 등)": "food_bunsik", "한식(국밥/찌개)": "food_korean", "양식(파스타 등)": "food_western" };
      const translatedFood = state.primary === "food" ? (typeof t === 'function' ? t(foodMap[state.detail] || state.detail) : state.detail) : null;

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
      } else if (lang === "ja") {
        data.ottTitle = `${ottName} おすすめコンテンツ`;
        data.ottGenre = `${mealInLang} にぴったりなジャンル`;
        data.foodName = translatedFood || "ピザ または チキン";
        data.foodReason = `${mealInLang} の状況に完璧に合う組み合わせです。`;
        data.bestMatchCombo = `現在の状況（${mealInLang}）を考慮して、最適な組み合わせをおすすめします！`;
        data.genreLabel = "ジャンル/特徴";
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

      if (typeof saveToHistory === 'function') {
        saveToHistory(`[${ottName}] ${data.ottGenre}`, data.foodName);
      }

      if (loadingSection) loadingSection.classList.add("hidden");
      if (resultSection) resultSection.classList.remove("hidden");

    } catch (error) {
      if (loadingSection) loadingSection.classList.add("hidden");
      showCustomAlert(typeof t === 'function' ? t("alert_error") : "오류가 발생했습니다.");
    }
  }

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => location.reload());
  }

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

  function goToMoviePage(ottName, mealName, foodName = "") {
  const ottUrlMap = {
    "넷플릭스": "netflix",
    "디즈니+": "disney",
    "티빙": "tving",
    "웨이브": "wavve",
  };

  const ottParam = ottUrlMap[ottName];

  if (!ottParam) {
    showCustomAlert(typeof t === "function" ? t("alert_ott") : "올바른 OTT를 선택해주세요.");
    return;
  }

  const mealParam = encodeURIComponent(mealName || "");
  const foodParam = encodeURIComponent(foodName || "");

  let url = `movie.html?ott=${ottParam}&meal=${mealParam}`;

  if (foodName) {
    url += `&food=${foodParam}`;
  }

  window.location.href = url;
}


  const editSavedComboBtn = document.getElementById("editSavedComboBtn");
  const savedManageModal = document.getElementById("savedManageModal");
  const closeSavedManageModal = document.getElementById("closeSavedManageModal");
  const savedManageDoneBtn = document.getElementById("savedManageDoneBtn");
  const savedManageList = document.getElementById("savedManageList");
  const savedMoreBtn = document.getElementById("savedMoreBtn");
  const savedViewModal = document.getElementById("savedViewModal");
const closeSavedViewModal = document.getElementById("closeSavedViewModal");
const savedViewDoneBtn = document.getElementById("savedViewDoneBtn");
const savedViewList = document.getElementById("savedViewList");

    // ===============================
  // 최근 저장한 조합 메인 화면 표시
  // ===============================

    if (editSavedComboBtn) {
    editSavedComboBtn.addEventListener("click", () => {
      openSavedManageModal();
    });
  }

    if (savedMoreBtn) {
    savedMoreBtn.addEventListener("click", () => {
    openSavedViewModal();
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

  if (closeSavedViewModal) {
  closeSavedViewModal.addEventListener("click", () => {
    closeSavedViewModalFn();
  });
}

if (savedViewDoneBtn) {
  savedViewDoneBtn.addEventListener("click", () => {
    closeSavedViewModalFn();
  });
}

if (savedViewModal) {
  savedViewModal.addEventListener("click", (event) => {
    if (event.target === savedViewModal) {
      closeSavedViewModalFn();
    }
  });
}

  function renderSavedCombosOnMain() {
    const savedComboList = document.getElementById("savedComboList");

    if (!savedComboList) return;

    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    const recentCombos = savedCombos.slice(-4).reverse();

    if (savedMoreBtn) {
  if (savedCombos.length > 4) {
    savedMoreBtn.classList.remove("hidden");
    savedMoreBtn.textContent = `저장 조합 더보기 (${savedCombos.length})`;
  } else {
    savedMoreBtn.classList.add("hidden");
  }
}

if (recentCombos.length === 0) {
  if (savedMoreBtn) {
    savedMoreBtn.classList.add("hidden");
  }

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

  function openSavedViewModal() {
  if (!savedViewModal) return;

  renderSavedViewList();
  savedViewModal.classList.add("show");
}

function closeSavedViewModalFn() {
  if (!savedViewModal) return;

  savedViewModal.classList.remove("show");
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

  function renderSavedViewList() {
  if (!savedViewList) return;

  const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];

  if (savedCombos.length === 0) {
    savedViewList.innerHTML = `
      <div class="saved-manage-empty">
        <p>저장된 조합이 없습니다.</p>
      </div>
    `;
    return;
  }

  const allCombos = [...savedCombos].reverse();

  savedViewList.innerHTML = allCombos
    .map((combo) => {
      const posterUrl = combo.posterPath
        ? `https://image.tmdb.org/t/p/w200${combo.posterPath}`
        : "";

      return `
        <div 
          class="saved-view-item"
          data-movie-id="${combo.movieId}"
          data-ott="${combo.ott}"
          data-meal="${combo.meal}"
          data-genre="${combo.genre}"
        >
          <div class="saved-view-poster-box">
            ${
              posterUrl
                ? `<img src="${posterUrl}" alt="${combo.movieTitle} 포스터" class="saved-view-poster">`
                : `<div class="saved-manage-no-poster">포스터 없음</div>`
            }
          </div>

          <div class="saved-view-info">
            <strong>${combo.movieTitle}</strong>
            <p>🍽 ${combo.foodName}</p>
          </div>

          <span class="saved-view-arrow">›</span>
        </div>
      `;
    })
    .join("");

  addSavedViewItemEvents();
}

function addSavedViewItemEvents() {
  document.querySelectorAll(".saved-view-item").forEach((item) => {
    item.addEventListener("click", () => {
      const movieId = item.dataset.movieId;
      const ott = item.dataset.ott;
      const meal = encodeURIComponent(item.dataset.meal);
      const genre = encodeURIComponent(item.dataset.genre);

      window.location.href =
        `recommend.html?movieId=${movieId}` +
        `&ott=${ott}` +
        `&meal=${meal}` +
        `&genre=${genre}`;
    });
  });
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
        window.location.href = `recommend.html?movieId=${movieId}&ott=${ott}&meal=${meal}&genre=${genre}`;
      });
    });
  }

  renderSavedCombosOnMain();
}); 