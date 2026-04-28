const ottUrlMap = {
  "넷플릭스": "netflix",
  "디즈니+": "disney",
  "티빙": "tving",
  "웨이브": "wavve",
};

const optionButtons = document.querySelectorAll(".option-btn");

optionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;
    const ottParam = ottUrlMap[value];

    if (!ottParam) {
      alert("올바른 OTT를 선택해주세요.");
      return;
    }

    window.location.href = `ott.html?ott=${ottParam}`;
  });
});