const ottNameMap = {
  netflix: "넷플릭스",
  disney: "디즈니+",
  tving: "티빙",
  wavve: "웨이브",
};

const sampleContents = {
  netflix: [
    {
      title: "스릴러 추천작",
      genre: "스릴러",
      description: "긴장감 있는 분위기의 콘텐츠입니다.",
    },
    {
      title: "코미디 시리즈",
      genre: "코미디",
      description: "가볍게 웃으면서 보기 좋은 콘텐츠입니다.",
    },
    {
      title: "몰입형 드라마",
      genre: "드라마",
      description: "한 번 보면 계속 보게 되는 몰입감 있는 작품입니다.",
    },
  ],

  disney: [
    {
      title: "디즈니 애니메이션",
      genre: "애니메이션",
      description: "가족, 친구, 연인과 함께 보기 좋은 콘텐츠입니다.",
    },
    {
      title: "마블 액션 영화",
      genre: "액션",
      description: "화려한 액션과 세계관을 즐길 수 있는 작품입니다.",
    },
  ],

  tving: [
    {
      title: "인기 예능",
      genre: "예능",
      description: "밥 먹으면서 가볍게 보기 좋은 예능 콘텐츠입니다.",
    },
    {
      title: "한국 드라마",
      genre: "드라마",
      description: "감정선이 좋은 한국형 드라마 콘텐츠입니다.",
    },
  ],

  wavve: [
    {
      title: "감성 드라마",
      genre: "드라마",
      description: "혼밥이나 야식 시간에 잔잔하게 보기 좋습니다.",
    },
    {
      title: "국내 예능",
      genre: "예능",
      description: "부담 없이 즐길 수 있는 국내 예능 콘텐츠입니다.",
    },
  ],
};

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");

const ottTitle = document.getElementById("ottTitle");
const contentList = document.getElementById("contentList");
const loadingText = document.getElementById("loadingText");
const backBtn = document.getElementById("backBtn");

const ottName = ottNameMap[ottKey] || "OTT";

ottTitle.textContent = `${ottName} 콘텐츠 목록`;

async function fetchOttContents(ottKey) {
  // 나중에 API 연결할 때 이 부분을 바꿀 예정
  // const response = await fetch(`API주소?ott=${ottKey}`);
  // const data = await response.json();
  // return data.results;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleContents[ottKey] || []);
    }, 500);
  });
}

async function renderOttContents() {
  const contents = await fetchOttContents(ottKey);

  loadingText.style.display = "none";

  if (contents.length === 0) {
    contentList.innerHTML = `
      <p>표시할 콘텐츠가 없습니다.</p>
    `;
    return;
  }

  contentList.innerHTML = contents
    .map((content) => {
      return `
        <div class="result-item">
          <strong>${content.title}</strong>
          <p>장르: ${content.genre}</p>
          <p>${content.description}</p>
        </div>
      `;
    })
    .join("");
}

backBtn.addEventListener("click", () => {
  window.location.href = "main.html";
});

renderOttContents();