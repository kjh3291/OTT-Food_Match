// 💡 맨 위: Firebase 도구 가져오기
import { auth, db } from './firebase.js';
import { collection, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

  const ottStepTitle = document.getElementById("ottStepTitle");

  function updateOttStepTitle() {
    if (!ottStepTitle) return;
    if (state.primary === "food") {
      ottStepTitle.textContent = "3. 이용 중인 OTT 플랫폼을 알려주세요.";
    } else {
      ottStepTitle.textContent = "3. 이용 중인 OTT 플랫폼을 알려주세요.";
    }
  }

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
      const totalSteps = 3;
      const percentage = (step / totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  }

  // 다음 단계 버튼
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (state.currentStep === 1) {
        if (!state.primary) {
          return showCustomAlert(typeof t === "function" ? t("alert_primary") : "기준을 선택해주세요.");
        }
        steps[1].classList.add("hidden");
        steps[1].classList.remove("active");
        steps[2].classList.remove("hidden");
        steps[2].classList.add("active");
        state.currentStep = 2;
        if (prevBtn) prevBtn.style.display = "block";
        updateProgress(2);
        return;
      }

      if (state.currentStep === 2) {
        if (!state.situation) {
          return showCustomAlert(typeof t === "function" ? t("alert_situation") : "상황을 선택해주세요.");
        }
        steps[2].classList.add("hidden");
        steps[2].classList.remove("active");

        if (state.primary === "ott") {
          steps["3-ott"].classList.remove("hidden");
          steps["3-ott"].classList.add("active");
          state.currentStep = "3-ott";
          updateProgress(3);
          return;
        }

        updateOttStepTitle();
        steps[4].classList.remove("hidden");
        steps[4].classList.add("active");
        state.currentStep = 4;
        updateProgress(3);
        return;
      }

      if (state.currentStep === "3-ott") {
        if (!state.detail) {
          return showCustomAlert(typeof t === "function" ? t("alert_detail") : "OTT를 선택해주세요.");
        }
        goToMoviePage(state.detail, state.situation);
        return;
      }

      if (state.currentStep === "3-food") {
        steps["3-food"].classList.add("hidden");
        steps["3-food"].classList.remove("active");
        updateOttStepTitle();
        steps[4].classList.remove("hidden");
        steps[4].classList.add("active");
        state.currentStep = 4;
        updateProgress(3);
        return;
      }

      if (state.currentStep === 4) {
        if (!state.selectedOtt) {
          return showCustomAlert(typeof t === "function" ? t("alert_ott") : "OTT를 선택해주세요.");
        }
        goToMapPage(state.selectedOtt, state.situation, "");
        return;
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
        return;
      }

      if (state.currentStep === "3-ott" || state.currentStep === "3-food" || state.currentStep === 4) {
        steps[state.currentStep].classList.add("hidden");
        steps[state.currentStep].classList.remove("active");
        steps[2].classList.remove("hidden");
        steps[2].classList.add("active");
        state.currentStep = 2;
        updateProgress(2);
        return;
      }
    });
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
    const ottUrlMap = { "넷플릭스": "netflix", "Netflix": "netflix", "netflix": "netflix", "디즈니+": "disney", "Disney+": "disney", "disney": "disney", "티빙": "tving", "TVING": "tving", "tving": "tving", "웨이브": "wavve", "wavve": "wavve", "Wavve": "wavve" };
    const ottParam = ottUrlMap[ottName];
    if (!ottParam) return showCustomAlert(typeof t === "function" ? t("alert_ott") : "올바른 OTT를 선택해주세요.");
    const mealParam = encodeURIComponent(mealName || "");
    const foodParam = encodeURIComponent(foodName || "");
    let url = `movie.html?ott=${ottParam}&meal=${mealParam}`;
    if (foodName) url += `&food=${foodParam}`;
    window.location.href = url;
  }

  function goToMapPage(ottName, mealName, foodCategory = "") {
    const ottUrlMap = { "넷플릭스": "netflix", "Netflix": "netflix", "netflix": "netflix", "디즈니+": "disney", "Disney+": "disney", "disney": "disney", "티빙": "tving", "TVING": "tving", "tving": "tving", "웨이브": "wavve", "wavve": "wavve", "Wavve": "wavve" };
    const ottParam = ottUrlMap[ottName];
    if (!ottParam) return showCustomAlert(typeof t === "function" ? t("alert_ott") : "올바른 OTT를 선택해주세요.");
    const mealParam = encodeURIComponent(mealName || "");
    const foodCategoryParam = encodeURIComponent(foodCategory || "");
    window.location.href = `map.html?ott=${ottParam}&meal=${mealParam}&foodCategory=${foodCategoryParam}`;
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
  const aiPickList = document.getElementById("aiPickList");
  const refreshAiPickBtn = document.getElementById("refreshAiPickBtn");

  if (editSavedComboBtn) editSavedComboBtn.addEventListener("click", () => { openSavedManageModal(); });
  if (savedMoreBtn) savedMoreBtn.addEventListener("click", () => { openSavedViewModal(); });
  if (refreshAiPickBtn) refreshAiPickBtn.addEventListener("click", () => { renderAiPicks(); });
  if (closeSavedManageModal) closeSavedManageModal.addEventListener("click", () => { closeSavedManageModalFn(); });
  if (savedManageDoneBtn) savedManageDoneBtn.addEventListener("click", () => { closeSavedManageModalFn(); });
  if (savedManageModal) savedManageModal.addEventListener("click", (event) => { if (event.target === savedManageModal) closeSavedManageModalFn(); });
  if (closeSavedViewModal) closeSavedViewModal.addEventListener("click", () => { closeSavedViewModalFn(); });
  if (savedViewDoneBtn) savedViewDoneBtn.addEventListener("click", () => { closeSavedViewModalFn(); });
  if (savedViewModal) savedViewModal.addEventListener("click", (event) => { if (event.target === savedViewModal) closeSavedViewModalFn(); });

  function renderSavedCombosOnMain() {
    const savedComboList = document.getElementById("savedComboList");
    if (!savedComboList) return;

    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];

    // 💡 제한을 풀고 저장된 모든 조합을 역순으로 가져옵니다 (슬라이더용)
    const recentCombos = [...savedCombos].reverse();

    // 💡 슬라이더로 모두 볼 수 있게 되었으므로 더보기 버튼은 항상 숨김 처리합니다
    if (savedMoreBtn) {
      savedMoreBtn.classList.add("hidden");
    }

    if (recentCombos.length === 0) {
      if (savedMoreBtn) savedMoreBtn.classList.add("hidden");
      savedComboList.innerHTML = `<div class="saved-empty-card"><div class="saved-empty-icon">🍿</div><h3>${typeof t === 'function' ? t('savedEmptyTitle') : '아직 저장한 조합이 없어요'}</h3><p>${typeof t === 'function' ? t('savedEmptyDesc') : '영화 상세 페이지에서 마음에 드는 조합을 저장하면 이곳에 표시됩니다.'}</p></div>`;
      return;
    }

    savedComboList.innerHTML = recentCombos.map((combo) => {
      const posterUrl = combo.posterPath ? `https://image.tmdb.org/t/p/w200${combo.posterPath}` : "";
      return `<div class="saved-mini-card" data-movie-id="${combo.movieId}" data-ott="${combo.ott}" data-meal="${combo.meal}" data-genre="${combo.genre}" data-food-name="${combo.foodName || ""}" data-food-category="${combo.foodCategory || "기타"}" data-reason="${combo.reason || ""}"><div class="saved-mini-poster-box">${posterUrl ? `<img src="${posterUrl}" alt="${combo.movieTitle} 포스터" class="saved-mini-poster">` : `<div class="saved-mini-no-poster">${typeof t === 'function' ? t('noPoster') : '포스터 없음'}</div>`}</div><div class="saved-mini-food"><span>🍽</span><strong>${combo.foodName}</strong></div></div>`;
    }).join("");
    addSavedMiniCardEvents();
  }

  function openSavedManageModal() { if (!savedManageModal) return; renderSavedManageList(); savedManageModal.classList.add("show"); }
  function openSavedViewModal() { if (!savedViewModal) return; renderSavedViewList(); savedViewModal.classList.add("show"); }
  function closeSavedViewModalFn() { if (!savedViewModal) return; savedViewModal.classList.remove("show"); }
  function closeSavedManageModalFn() { if (!savedManageModal) return; savedManageModal.classList.remove("show"); }

  function renderSavedManageList() {
    if (!savedManageList) return;
    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    if (savedCombos.length === 0) {
      savedManageList.innerHTML = `<div class="saved-manage-empty"><p>${typeof t === 'function' ? t('noSavedCombo') : '저장된 조합이 없습니다.'}</p></div>`;
      return;
    }
    const recentCombos = [...savedCombos].reverse();
    savedManageList.innerHTML = recentCombos.map((combo) => {
      const posterUrl = combo.posterPath ? `https://image.tmdb.org/t/p/w200${combo.posterPath}` : "";
      return `<div class="saved-manage-item"><div class="saved-manage-poster-box">${posterUrl ? `<img src="${posterUrl}" alt="${combo.movieTitle} 포스터" class="saved-manage-poster">` : `<div class="saved-manage-no-poster">${typeof t === 'function' ? t('noPoster') : '포스터 없음'}</div>`}</div><div class="saved-manage-info"><strong>${combo.movieTitle}</strong><p>🍽 ${combo.foodName}</p></div><button class="saved-remove-btn" data-movie-id="${combo.movieId}" data-food-name="${combo.foodName}">${typeof t === 'function' ? t('cancelSave') : '저장 취소'}</button></div>`;
    }).join("");
    addSavedRemoveEvents();
  }

  function renderSavedViewList() {
    if (!savedViewList) return;
    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    if (savedCombos.length === 0) {
      savedViewList.innerHTML = `<div class="saved-manage-empty"><p>${typeof t === 'function' ? t('noSavedCombo') : '저장된 조합이 없습니다.'}</p></div>`;
      return;
    }
    const allCombos = [...savedCombos].reverse();
    savedViewList.innerHTML = allCombos.map((combo) => {
      const posterUrl = combo.posterPath ? `https://image.tmdb.org/t/p/w200${combo.posterPath}` : "";
      return `<div class="saved-view-item" data-movie-id="${combo.movieId}" data-ott="${combo.ott}" data-meal="${combo.meal}" data-genre="${combo.genre}" data-food-name="${combo.foodName || ""}" data-food-category="${combo.foodCategory || "기타"}" data-reason="${combo.reason || ""}"><div class="saved-view-poster-box">${posterUrl ? `<img src="${posterUrl}" alt="${combo.movieTitle} 포스터" class="saved-view-poster">` : `<div class="saved-manage-no-poster">${typeof t === 'function' ? t('noPoster') : '포스터 없음'}</div>`}</div><div class="saved-view-info"><strong>${combo.movieTitle}</strong><p>🍽 ${combo.foodName}</p></div><span class="saved-view-arrow">›</span></div>`;
    }).join("");
    addSavedViewItemEvents();
  }

  function addSavedViewItemEvents() {
    document.querySelectorAll(".saved-view-item").forEach((item) => {
      item.addEventListener("click", () => {
        const movieId = item.dataset.movieId;
        const ott = item.dataset.ott;
        const meal = encodeURIComponent(item.dataset.meal || "");
        const genre = encodeURIComponent(item.dataset.genre || "전체");
        const foodName = encodeURIComponent(item.dataset.foodName || "");
        const foodCategory = encodeURIComponent(item.dataset.foodCategory || "기타");
        const reason = encodeURIComponent(item.dataset.reason || "");
        window.location.href = `recommend.html?movieId=${movieId}&ott=${ott}&meal=${meal}&genre=${genre}&mode=saved&foodName=${foodName}&foodCategory=${foodCategory}&reason=${reason}`;
      });
    });
  }

  function addSavedRemoveEvents() {
    document.querySelectorAll(".saved-remove-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const movieId = Number(button.dataset.movieId);
        const foodName = button.dataset.foodName;
        const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
        const targetCombo = savedCombos.find(c => c.movieId === movieId && c.foodName === foodName);

        // 1. Firebase DB에서 삭제
        if (targetCombo && targetCombo.docId) {
          try {
            await deleteDoc(doc(db, "savedCombos", targetCombo.docId));
          } catch (e) { console.error("DB 삭제 실패", e); }
        }

        // 2. 로컬 캐시 삭제
        const filteredCombos = savedCombos.filter((combo) => {
          return !(combo.movieId === movieId && combo.foodName === foodName);
        });
        localStorage.setItem("savedCombos", JSON.stringify(filteredCombos));
        showCustomAlert(typeof t === 'function' ? t('comboDeleted') : "저장한 조합이 삭제되었습니다.");
        renderSavedCombosOnMain();
        renderSavedManageList();
      });
    });
  }

  // ===============================
  // AI 추천 조합 임시 구현
  // ===============================
  const aiMovieCandidates = [{ genre: "액션", movieHintKey: "aiHint_action", ott: "netflix" }, { genre: "코미디", movieHintKey: "aiHint_comedy", ott: "tving" }, { genre: "드라마", movieHintKey: "aiHint_drama", ott: "wavve" }, { genre: "로맨스", movieHintKey: "aiHint_romance", ott: "disney" }, { genre: "스릴러", movieHintKey: "aiHint_thriller", ott: "netflix" }, { genre: "애니메이션", movieHintKey: "aiHint_animation", ott: "disney" }];
  const aiFoodCandidates = { ko: ["치킨", "피자", "떡볶이", "햄버거", "파스타", "티라미수", "새우버거", "로제파스타", "수제쿠키", "치즈케이크", "도넛", "감자튀김"], en: ["Chicken", "Pizza", "Tteokbokki", "Burger", "Pasta", "Tiramisu", "Shrimp Burger", "Rose Pasta", "Cookies", "Cheesecake", "Donuts", "Fries"], zh: ["炸鸡", "披萨", "辣炒年糕", "汉堡", "意面", "提拉米苏", "虾堡", "粉红酱意面", "曲奇", "芝士蛋糕", "甜甜圈", "炸薯条"], ja: ["チキン", "ピザ", "トッポッキ", "ハンバーガー", "パスタ", "ティラミス", "エビバーガー", "ロゼパスタ", "クッキー", "チーズケーキ", "ドーナツ", "フライドポテト"] };

  function getRandomItem(array) { return array[Math.floor(Math.random() * array.length)]; }
  function getGenreKey(genre) { const map = { "전체": "all", "액션": "action", "코미디": "comedy", "드라마": "drama", "로맨스": "romance", "스릴러": "thriller", "애니메이션": "animation" }; return map[genre] || "all"; }

  function getBasedOnSavedPick(savedCombos) {
    const lang = typeof getLang === 'function' ? getLang() : "ko";
    if (!savedCombos || savedCombos.length === 0) {
      const randomMovie = getRandomItem(aiMovieCandidates);
      const randomFood = getRandomItem(aiFoodCandidates[lang] || aiFoodCandidates["ko"]);
      return { type: "based", badge: typeof t === 'function' ? t('aiBadgeBased') : "취향 기반", title: typeof t === 'function' ? t('aiTitleWait') : "저장 조합을 기다리는 추천", movieHintKey: randomMovie.movieHintKey, genre: randomMovie.genre, ott: randomMovie.ott, foodName: randomFood, reason: typeof t === 'function' ? t('aiReasonWait') : "아직 저장한 조합이 많지 않아, 누구나 편하게 즐길 수 있는 조합으로 추천했어요." };
    }
    const recentCombo = savedCombos[savedCombos.length - 1];
    const similarGenreMap = { "액션": ["액션", "스릴러"], "스릴러": ["스릴러", "액션"], "코미디": ["코미디", "애니메이션"], "애니메이션": ["애니메이션", "코미디"], "드라마": ["드라마", "로맨스"], "로맨스": ["로맨스", "드라마"], "전체": ["액션", "코미디", "드라마", "로맨스", "스릴러", "애니메이션"] };
    const similarGenres = similarGenreMap[recentCombo.genre] || similarGenreMap["전체"];
    const pickedGenre = getRandomItem(similarGenres);
    const movieCandidate = aiMovieCandidates.find((item) => item.genre === pickedGenre) || getRandomItem(aiMovieCandidates);
    const pickedFood = getRandomItem(aiFoodCandidates[lang] || aiFoodCandidates["ko"]);
    let basedReason = "";
    if (lang === "en") basedReason = `Based on your recent save "${recentCombo.movieTitle} + ${recentCombo.foodName}", we picked a similar vibe.`; else if (lang === "zh") basedReason = `参考了您最近保存的“${recentCombo.movieTitle} + ${recentCombo.foodName}”，我们挑选了相似氛围的组合。`; else if (lang === "ja") basedReason = `最近保存した「${recentCombo.movieTitle} + ${recentCombo.foodName}」を参考に、似た雰囲気を選びました。`; else basedReason = `최근 저장한 “${recentCombo.movieTitle} + ${recentCombo.foodName}” 조합을 참고해서 비슷한 분위기로 골라봤어요.`;
    return { type: "based", badge: typeof t === 'function' ? t('aiBadgeBased') : "취향 기반", title: typeof t === 'function' ? t('aiTitleRecent') : "최근 저장 조합을 참고했어요", movieHintKey: movieCandidate.movieHintKey, genre: movieCandidate.genre, ott: recentCombo.ott || movieCandidate.ott, foodName: pickedFood, reason: basedReason };
  }

  function getRandomAiPick() {
    const lang = typeof getLang === 'function' ? getLang() : "ko";
    const movieCandidate = getRandomItem(aiMovieCandidates);
    const foodName = getRandomItem(aiFoodCandidates[lang] || aiFoodCandidates["ko"]);
    return { type: "random", badge: typeof t === 'function' ? t('aiBadgeRandom') : "랜덤 추천", title: typeof t === 'function' ? t('aiTitleRandom') : "오늘은 이런 조합 어때요?", movieHintKey: movieCandidate.movieHintKey, genre: movieCandidate.genre, ott: movieCandidate.ott, foodName, reason: typeof t === 'function' ? t('aiReasonRandom') : "평소와 다른 조합을 시도해볼 수 있도록 무작위로 골라봤어요." };
  }

  function makeAiPicks() {
    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    return [getBasedOnSavedPick(savedCombos), getRandomAiPick(), getRandomAiPick()];
  }

  function getUserSignals() {
    const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
    return { savedCombos: read("savedCombos"), recommendReactions: read("recommendReactions"), matchHistory: read("matchHistory") };
  }

  async function fetchAiPicksFromServer() {
    const response = await fetch("/api/ai-recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(getUserSignals()) });
    if (!response.ok) throw new Error("AI 추천 API 요청에 실패했습니다.");
    const data = await response.json();
    if (!data.recommendations || !Array.isArray(data.recommendations)) throw new Error("AI 추천 응답 형식이 올바르지 않습니다.");
    return data.recommendations;
  }

  let currentAiPicks = [];

  function renderAiPickCards(picks) {
    if (!aiPickList) return;

    aiPickList.innerHTML = picks.map((pick) => {
      const safeGenre = pick.genre || "코미디";
      const safeFoodName = pick.foodName || "치킨";
      const safeFoodCategory = pick.foodCategory || "AI 추천";
      const safeOtt = pick.ott || "netflix";

      const safeReason =
        pick.reason ||
        `${safeGenre} 장르의 분위기와 잘 어울리는 ${safeFoodName} 조합입니다.`;

      const rawMovieHint =
        pick.movieHint ||
        pick.movieMood ||
        pick.movieHintKey ||
        "";

      let safeMovieHint = "";

      if (rawMovieHint && typeof t === "function") {
        const translatedHint = t(rawMovieHint);
        safeMovieHint =
          translatedHint && translatedHint !== rawMovieHint
            ? translatedHint
            : `${safeGenre} 장르의 분위기 있는 영화`;
      } else {
        safeMovieHint = rawMovieHint || `${safeGenre} 장르의 분위기 있는 영화`;
      }

      const safeTitle =
        pick.title ||
        (pick.type === "based" ? "취향을 참고한 추천" : "오늘의 랜덤 추천");

      const safeBadge =
        pick.badge ||
        (pick.type === "based" ? "취향 기반" : "랜덤 추천");

      const badgeClass =
        pick.type === "based" ? "ai-pick-badge" : "ai-pick-badge random";

      const genreTrans =
        typeof t === "function"
          ? t("tab_" + getGenreKey(safeGenre))
          : safeGenre;

      const movieText =
        typeof t === "function" ? t("aiRowMovie") : "🎬 추천 영화 분위기";

      const genreText =
        typeof t === "function" ? t("aiRowGenre") : "🎭 추천 장르";

      const foodText =
        typeof t === "function" ? t("aiRowFood") : "🍽 추천 음식";

      const clickGuide =
        typeof t === "function" ? t("aiClickGuide") : "이 장르 영화 보러가기 →";

      return `
      <div
        class="ai-pick-card ai-genre-card"
        data-ott="${safeOtt}"
        data-genre="${safeGenre}"
        data-food-name="${safeFoodName}"
        data-food-category="${safeFoodCategory}"
        data-reason="${safeReason}"
      >
        <span class="${badgeClass}">${safeBadge}</span>

        <h3>${safeTitle}</h3>

        <div class="ai-pick-row">
          <strong>${movieText}</strong>
          <p>${safeMovieHint}</p>
        </div>

        <div class="ai-pick-row">
          <strong>${genreText}</strong>
          <p>${genreTrans}</p>
        </div>

        <div class="ai-pick-row">
          <strong>${foodText}</strong>
          <p>${safeFoodName} <span class="ai-pick-cat">(${safeFoodCategory})</span></p>
        </div>

        <p class="ai-pick-reason">${safeReason}</p>
        <p class="ai-pick-click-guide">${clickGuide}</p>
      </div>
    `;
    }).join("");

    addAiGenreCardEvents();
  }

  function addAiGenreCardEvents() {
    document.querySelectorAll(".ai-genre-card").forEach((card) => {
      card.addEventListener("click", () => {
        const ott = card.dataset.ott || "netflix";

        const genre = encodeURIComponent(card.dataset.genre || "코미디");
        const foodParam = encodeURIComponent(card.dataset.foodName || "치킨");
        const foodCategoryParam = encodeURIComponent(
          card.dataset.foodCategory || "AI 추천"
        );

        const reasonParam = encodeURIComponent(
          card.dataset.reason ||
          "AI가 영화 분위기와 식사 상황을 고려해 고른 조합입니다."
        );

        const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
        const recentCombo = savedCombos[savedCombos.length - 1];
        const meal = encodeURIComponent(recentCombo?.meal || "혼밥");

        window.location.href =
          `movie.html?ott=${ott}` +
          `&meal=${meal}` +
          `&genre=${genre}` +
          `&food=${foodParam}` +
          `&foodCategory=${foodCategoryParam}` +
          `&aiReason=${reasonParam}`;
      });

      async function renderAiPicks() {
        if (!aiPickList) return;
        aiPickList.innerHTML = `<div class="saved-empty-card"><div class="saved-empty-icon">🤖</div><h3>${typeof t === 'function' ? t('aiPickLoadingTitle') : 'AI가 조합을 고르는 중이에요'}</h3><p>${typeof t === 'function' ? t('aiPickLoadingDesc') : '저장한 조합을 참고해서 추천을 만들고 있어요. 잠시만 기다려주세요.'}</p></div>`;
        try {
          const aiPicks = await fetchAiPicksFromServer();
          currentAiPicks = aiPicks;
          renderAiPickCards(currentAiPicks);
        } catch (error) {
          console.error("AI 추천 API 오류:", error);
          aiPickList.innerHTML = `<div class="saved-empty-card ai-error-card"><div class="saved-empty-icon">⚠️</div><h3>${typeof t === 'function' ? t('aiPickErrorTitle') : 'AI 추천을 불러오지 못했어요'}</h3><p>${typeof t === 'function' ? t('aiPickErrorDesc') : '잠시 후 다시 시도해주세요. 지금은 기본 추천 조합을 대신 보여드릴게요.'}</p></div>`;
          showCustomAlert(typeof t === 'function' ? t('aiPickErrorAlert') : "AI 추천 연결이 불안정해요. 잠시 후 다시 시도해주세요.");
          setTimeout(() => { currentAiPicks = makeAiPicks(); renderAiPickCards(currentAiPicks); }, 1200);
        }
      }

      function addSavedMiniCardEvents() {
        document.querySelectorAll(".saved-mini-card").forEach((card) => {
          card.addEventListener("click", () => {
            const movieId = card.dataset.movieId;
            const ott = card.dataset.ott;
            const meal = encodeURIComponent(card.dataset.meal || "");
            const genre = encodeURIComponent(card.dataset.genre || "전체");
            const foodName = encodeURIComponent(card.dataset.foodName || "");
            const foodCategory = encodeURIComponent(card.dataset.foodCategory || "기타");
            const reason = encodeURIComponent(card.dataset.reason || "");
            window.location.href = `recommend.html?movieId=${movieId}&ott=${ott}&meal=${meal}&genre=${genre}&mode=saved&foodName=${foodName}&foodCategory=${foodCategory}&reason=${reason}`;
          });
        });
      }

      document.addEventListener("languageChanged", () => {
        renderSavedCombosOnMain();
        renderSavedManageList();
        renderSavedViewList();
        if (currentAiPicks && currentAiPicks.length > 0) {
          const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
          currentAiPicks[0] = getBasedOnSavedPick(savedCombos);
          renderAiPickCards(currentAiPicks);
        }
      });

      renderSavedCombosOnMain();
      renderAiPicks();

      const settingBtn = document.getElementById("settingBtn");
      const settingPopup = document.getElementById("settingPopup");
      const darkModeToggle = document.getElementById("darkModeToggle");

      if (settingBtn && settingPopup) {
        settingBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          settingPopup.classList.toggle("hidden");
        });
        settingPopup.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        document.addEventListener("click", () => {
          settingPopup.classList.add("hidden");
        });
      }

      // 💡 다크모드 초기화 및 클릭 이벤트 추가!
      if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
      }

      if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
          document.body.classList.toggle("dark-mode");
          localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");

          // 다국어 텍스트 업데이트 트리거 발송
          if (typeof applyLanguage === "function") {
            applyLanguage();
          }
          document.dispatchEvent(new Event("languageChanged"));
        });

        // ===============================
        // 💡 DB에서 내 조합 불러와서 로컬에 동기화하는 함수 (이전에 누락되었던 핵심 로직!)
        // ===============================
        async function syncSavedCombosFromDB(user) {
          if (!user) {
            localStorage.removeItem("savedCombos");
            return;
          }
          try {
            const q = query(collection(db, "savedCombos"), where("userId", "==", user.uid));
            const snap = await getDocs(q);
            const combos = [];
            snap.forEach(doc => {
              combos.push({ docId: doc.id, ...doc.data() });
            });
            combos.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
            localStorage.setItem("savedCombos", JSON.stringify(combos));
          } catch (e) {
            console.error("데이터 동기화 실패:", e);
          }
        }

        // 💡 로그인 상태가 변할 때마다(로그인/로그아웃) 데이터를 갱신하고 화면을 다시 그림
        onAuthStateChanged(auth, async (user) => {
          const savedComboList = document.getElementById("savedComboList");
          if (user) {
            if (savedComboList) savedComboList.innerHTML = `<p style="text-align:center; padding: 20px;">내 조합을 불러오는 중입니다 🍿</p>`;
            await syncSavedCombosFromDB(user);
          } else {
            await syncSavedCombosFromDB(null);
          }
          renderSavedCombosOnMain();
        });

      });