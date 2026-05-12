const ottUrlMap = {
  "넷플릭스": "netflix",
  "디즈니+": "disney",
  "티빙": "tving",
  "웨이브": "wavve",
};

const ottCards = document.querySelectorAll(".ott-logo-card");

ottCards.forEach((card) => {
  card.addEventListener("click", () => {
    const value = card.dataset.value;
    const ottParam = ottUrlMap[value];

    if (!ottParam) {
      alert("올바른 OTT를 선택해주세요.");
      return;
    }

    window.location.href = `ott.html?ott=${ottParam}`;
  });
});