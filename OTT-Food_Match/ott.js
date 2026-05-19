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