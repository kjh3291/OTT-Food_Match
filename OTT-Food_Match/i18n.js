// ==========================================
// 🌐 통합 다국어(i18n) 및 모달 관리 모듈
// ==========================================

const i18nData = {
  ko: {
    // ⚙️ 공통, 설정 및 모달
    settingBtn: "⚙ 설정", settingTitle: "설정", 
    langMenuBtn: "🌐 언어 설정", langModalTitle: "언어 설정", closeLangModal: "닫기",
    prevBtn: "이전 단계", nextBtn: "다음 단계", nextBtnResult: "추천 결과 보기 ✨",
    alert_primary: "기준을 선택해주세요.", alert_situation: "현재 상황을 선택해주세요.", alert_detail: "상세 항목을 선택해주세요.",
    alert_ott: "올바른 OTT를 선택해주세요.", alert_error: "결과를 불러오는 중 문제가 발생했습니다.", alert_copied: "결과가 이미지로 저장되었습니다!",
    
    // 🍿 메인 페이지 (main.html)
    mainTitle: "🍿 뭐 볼까, 뭐 먹을까", mainDesc: "OTT와 음식 조합을 한 번에 추천해주는 서비스",
    step1Title: "1. 어떤 것을 먼저 고르시겠어요?", step1Opt1: "📺 볼 콘텐츠(OTT) 기준", step1Opt2: "🍕 먹을 음식 메뉴 기준",
    step2Title: "2. 현재 식사 상황은 어떠신가요?",
    meal_honbab: "혼밥", meal_yasik: "야식", meal_friends: "친구와 함께", meal_couple: "연인과 함께", meal_light: "간단한 식사", meal_heavy: "든든한 식사",
    step3OttTitle: "3. 이용 중인 OTT 플랫폼을 알려주세요.", step3FoodTitle: "3. 어떤 종류의 음식이 끌리시나요?", step4OttTitle: "4. 이용 중인 OTT 플랫폼을 알려주세요.",
    food_chicken_pizza: "치킨/피자", food_bunsik: "분식(떡볶이 등)", food_korean: "한식(국밥/찌개)", food_western: "양식(파스타 등)",
    loadingTitle: "맞춤 조합을 찾는 중입니다...", loadingDesc: "잠시만 기다려주세요 🍿",
    resultTitle: "✨ 맞춤 추천 결과 ✨", resContentTitle: "🎬 추천 콘텐츠", resFoodTitle: "🍕 추천 음식", resComboTitle: "💡 Best Match Combo",
    shareBtn: "결과 공유하기 🔗", resetBtn: "처음부터 다시하기",

    // 🎬 영화 검색 페이지 (movie.html)
    genreTitle: "장르 카테고리",
    tab_all: "전체", tab_action: "액션", tab_comedy: "코미디", tab_drama: "드라마", tab_romance: "로맨스", tab_thriller: "스릴러", tab_animation: "애니메이션",
    clickPosterInfo: "영화 포스터를 클릭하면 설명과 추천 음식이 표시됩니다.", backToMainBtn: "메인으로 돌아가기",
    loadingText: "영화 목록을 불러오는 중입니다...", movieDescHeader: "🎬 영화 설명", foodRecHeader: "🍽 추천 음식",
    releaseDate: "개봉일", rating: "평점", noReleaseInfo: "개봉일 정보 없음", noRatingInfo: "정보 없음",
    noOverview: "줄거리 정보가 없습니다.", noTitle: "제목 없음", noMoviesTitle: "선택한 조건에 맞는 영화가 없습니다.",
    noMoviesDesc: "다른 장르를 선택하거나 OTT를 바꿔서 다시 시도해보세요.",

    recommendPageTitle: "추천 상세",
    recommendPageInfo: "선택한 영화와 어울리는 음식을 확인해보세요.",
    reactionTitle: "이 추천은 어땠나요?",
    likeBtn: "👍 좋아요",
    dislikeBtn: "👎 싫어요",
    saveComboBtn: "💾 조합 저장",
    backToMovieBtn: "영화 목록으로 돌아가기",
    
  },
  en: {
    // ⚙️ Common & Settings
    settingBtn: "⚙ Settings", settingTitle: "Settings", 
    langMenuBtn: "🌐 Language", langModalTitle: "Language Settings", closeLangModal: "Close",
    prevBtn: "Previous", nextBtn: "Next", nextBtnResult: "View Result ✨",
    alert_primary: "Please select a criteria.", alert_situation: "Please select your current situation.", alert_detail: "Please select a detailed item.",
    alert_ott: "Please select a valid OTT.", alert_error: "A problem occurred while fetching results.", alert_copied: "Result saved as an image!",
    
    // 🍿 Main Page
    mainTitle: "🍿 What to Watch, What to Eat", mainDesc: "OTT and food combination recommendation service",
    step1Title: "1. Which one would you like to choose first?", step1Opt1: "📺 Based on Content (OTT)", step1Opt2: "🍕 Based on Food Menu",
    step2Title: "2. What is your current meal situation?",
    meal_honbab: "Eating Alone", meal_yasik: "Late Night Snack", meal_friends: "With Friends", meal_couple: "With Partner", meal_light: "Light Meal", meal_heavy: "Hearty Meal",
    step3OttTitle: "3. Please select your OTT platform.", step3FoodTitle: "3. What kind of food are you craving?", step4OttTitle: "4. Please select your OTT platform.",
    food_chicken_pizza: "Chicken/Pizza", food_bunsik: "Street Food", food_korean: "Korean Food", food_western: "Western Food",
    loadingTitle: "Finding the perfect match...", loadingDesc: "Please wait a moment 🍿",
    resultTitle: "✨ Custom Recommendation Results ✨", resContentTitle: "🎬 Recommended Content", resFoodTitle: "🍕 Recommended Food", resComboTitle: "💡 Best Match Combo",
    shareBtn: "Save Image 🔗", resetBtn: "Restart",

    // 🎬 Movie Page
    genreTitle: "Genre Categories",
    tab_all: "All", tab_action: "Action", tab_comedy: "Comedy", tab_drama: "Drama", tab_romance: "Romance", tab_thriller: "Thriller", tab_animation: "Animation",
    clickPosterInfo: "Click a poster to view details and food pairing.", backToMainBtn: "Go to Main",
    loadingText: "Loading movies...", movieDescHeader: "🎬 Movie Details", foodRecHeader: "🍽 Food Pairing",
    releaseDate: "Release", rating: "Rating", noReleaseInfo: "No date info", noRatingInfo: "No info",
    noOverview: "No plot description available.", noTitle: "No Title", noMoviesTitle: "No movies found matching criteria.",
    noMoviesDesc: "Try selecting another genre or changing the OTT platform.",

    recommendPageTitle: "Recommendation Details",
    recommendPageInfo: "Check out the food pairing that matches your selected movie.",
    reactionTitle: "How was this recommendation?",
    likeBtn: "👍 Like",
    dislikeBtn: "👎 Dislike",
    saveComboBtn: "💾 Save Combo",
    backToMovieBtn: "Back to Movie List",
  }
};

function getLang() { return localStorage.getItem("lang") || "ko"; }
function t(key) { return i18nData[getLang()][key] || key; }

function applyLanguage() {
  const lang = getLang();
  Object.keys(i18nData[lang]).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = i18nData[lang][id];
  });

  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    if (document.body.classList.contains("dark-mode")) {
      darkModeToggle.textContent = lang === "ko" ? "☀️ 라이트 모드" : "☀️ Light Mode";
    } else {
      darkModeToggle.textContent = lang === "ko" ? "🌙 다크 모드" : "🌙 Dark Mode";
    }
  }

  document.dispatchEvent(new Event("languageChanged"));
}

document.addEventListener("DOMContentLoaded", () => {
  // 💡 1. 모달 및 설정창 요소 가져오기
  const langMenuBtn = document.getElementById("langMenuBtn");
  const langModal = document.getElementById("langModal");
  const closeLangModal = document.getElementById("closeLangModal");
  const settingPopup = document.getElementById("settingPopup");

  // 💡 2. '언어 설정' 메뉴 클릭 시 팝업 닫고 모달 열기
  if (langMenuBtn && langModal) {
    langMenuBtn.addEventListener("click", () => {
      if (settingPopup) settingPopup.classList.add("hidden"); // 설정창 닫기
      langModal.classList.add("show"); // 언어 선택 모달 열기
      
      // 현재 적용된 언어를 찾아 버튼 스타일 강조
      const currentLang = getLang();
      document.querySelectorAll(".lang-select-btn").forEach(btn => {
        if(btn.dataset.lang === currentLang) btn.classList.add("active-lang");
        else btn.classList.remove("active-lang");
      });
    });
  }

  // 💡 3. 모달 닫기 로직 (닫기 버튼 누르거나, 배경 어두운 곳 클릭 시)
  if (closeLangModal) {
    closeLangModal.addEventListener("click", () => langModal.classList.remove("show"));
  }
  if (langModal) {
    langModal.addEventListener("click", (e) => {
      if (e.target === langModal) langModal.classList.remove("show");
    });
  }

  // 💡 4. 모달 안에서 언어(한국어/영어)를 선택했을 때의 처리
  document.querySelectorAll(".lang-select-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedLang = e.target.dataset.lang;
      localStorage.setItem("lang", selectedLang); // 선택한 언어 저장
      applyLanguage(); // 즉시 화면 전체 글자 변경
      langModal.classList.remove("show"); // 선택 후 모달 자동 닫기
    });
  });
  
  applyLanguage();
});

