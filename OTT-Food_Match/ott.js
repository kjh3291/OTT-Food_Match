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
  genres: [],
  meal: "",
};

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");


// ===============================
// 2. HTML 요소 가져오기
// ===============================

const ottTitle = document.getElementById("ottTitle");
const optionButtons = document.querySelectorAll(".option-btn");
const recommendContentBtn = document.getElementById("recommendContentBtn");
const backBtn = document.getElementById("backBtn");

// ===============================
// 3. 초기 화면 설정
// ===============================

const ottName = ottNameMap[ottKey] || "OTT";
ottTitle.textContent = `${ottName} 콘텐츠 추천`;

if (!ottKey) {
  alert("OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.");
  window.location.href = "main.html";
}

// ===============================
// 4. 장르 / 식사 상황 선택 기능
// ===============================

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;

    // 장르는 여러 개 선택 가능
    if (type === "genre") {
      if (selections.genres.includes(value)) {
        selections.genres = selections.genres.filter((genre) => genre !== value);
        button.classList.remove("selected");
      } else {
        selections.genres.push(value);
        button.classList.add("selected");
      }
      return;
    }

    // 식사 상황은 하나만 선택 가능
    if (type === "meal") {
      selections.meal = value;
      document
        .querySelectorAll('.option-btn[data-type="meal"]')
        .forEach((btn) => btn.classList.remove("selected"));

      button.classList.add("selected");
    }
  });
});

// ===============================
// 5. 영화 페이지로 이동
// ===============================

recommendContentBtn.addEventListener("click", () => {
  if (selections.genres.length === 0) {
    alert("장르를 하나 이상 선택해주세요.");
    return;
  }

  if (!selections.meal) {
    alert("식사 상황을 선택해주세요.");
    return;
  }

  const genresParam = encodeURIComponent(selections.genres.join(","));
  const mealParam = encodeURIComponent(selections.meal);

  window.location.href = `movie.html?ott=${ottKey}&genres=${genresParam}&meal=${mealParam}`;
});

// ===============================
// 6. 뒤로가기 버튼
// ===============================

backBtn.addEventListener("click", () => {
  window.location.href = "main.html";
});