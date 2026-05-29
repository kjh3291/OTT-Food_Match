// ===============================
// 1. 기본 설정
// ===============================

const ottNameMap = {
  netflix: "넷플릭스",
  disney: "디즈니+",
  tving: "티빙",
  wavve: "웨이브",
};

const selections = {
  meal: "",
};

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");


// ===============================
// 2. HTML 요소 가져오기
// ===============================

const ottTitle = document.getElementById("ottTitle");
const mealButtons = document.querySelectorAll('.option-btn[data-type="meal"]');
const goMovieBtn = document.getElementById("goMovieBtn");
const backBtn = document.getElementById("backBtn");


// ===============================
// 3. 초기 화면 설정
// ===============================

const ottName = ottNameMap[ottKey] || "OTT";

if (!ottKey) {
  alert("OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.");
  window.location.href = "main.html";
}

ottTitle.textContent = `${ottName} 식사 상황 선택`;


// ===============================
// 4. 식사 상황 선택 기능
// ===============================

mealButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    selections.meal = value;

    mealButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");

    console.log("선택된 식사 상황:", selections.meal);
  });
});


// ===============================
// 5. 영화 페이지로 이동
// ===============================

goMovieBtn.addEventListener("click", () => {
  if (!selections.meal) {
    alert("식사 상황을 선택해주세요.");
    return;
  }

  const mealParam = encodeURIComponent(selections.meal);

  window.location.href = `movie.html?ott=${ottKey}&meal=${mealParam}`;
});


// ===============================
// 6. 뒤로가기 버튼
// ===============================

backBtn.addEventListener("click", () => {
  window.location.href = "main.html";
});


// ===============================
// 결과 공유하기 기능
// ===============================
const shareBtn = document.getElementById("shareBtn");

if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    // 렌더링된 결과 화면에서 추천 콘텐츠 제목과 음식 설명을 추출합니다.
    const contentTitle = document.getElementById("selectedContentTitle") ? document.getElementById("selectedContentTitle").innerText : "추천 콘텐츠";
    const foodDesc = document.getElementById("selectedContentDesc") ? document.getElementById("selectedContentDesc").innerText : "추천 음식";
    
    // 클립보드에 복사될 텍스트 템플릿 생성
    const shareText = `🍿 뭐 볼까, 뭐 먹을까 🍕\n\n[추천 결과]\n🎬 콘텐츠: ${contentTitle}\n🍽️ 음식 추천: ${foodDesc}\n\n우리 이거 같이 볼래? 👀`;

    // 클립보드 API를 사용해 텍스트 복사
    navigator.clipboard.writeText(shareText).then(() => {
      // 기존에 구현된 커스텀 알림창 함수가 존재하면 호출하고, 없으면 기본 alert 실행
      if (typeof showCustomAlert === "function") {
        showCustomAlert("추천 결과가 복사되었습니다!");
      } else {
        alert("추천 결과가 클립보드에 복사되었습니다!\n붙여넣기(Ctrl+V)로 공유해보세요.");
      }
    }).catch((err) => {
      console.error('Clipboard Error:', err);
      alert("복사에 실패했습니다.");
    });
  });
}