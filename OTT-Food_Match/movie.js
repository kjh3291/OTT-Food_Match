// ===============================
// 1. 기본 설정 및 데이터 매핑
// ===============================
const ottNameMap = { netflix: "넷플릭스", disney: "디즈니+", tving: "티빙", wavve: "웨이브" };
const ottNameMapEn = { netflix: "Netflix", disney: "Disney+", tving: "TVING", wavve: "wavve" };
const ottNameMapZh = { netflix: "网飞", disney: "迪士尼+", tving: "TVING", wavve: "wavve" };
const ottNameMapJa = { netflix: "Netflix", disney: "Disney+", tving: "TVING", wavve: "wavve" };

const ottProviderMap = { netflix: 8, disney: 337, wavve: 356, tving: 97 };
const genreIdMap = { "액션": 28, "코미디": 35, "드라마": 18, "로맨스": 10749, "스릴러": 53, "애니메이션": 16 };

const mealMapEn = { "혼밥": "Eating Alone", "야식": "Late Night Snack", "친구와 함께": "With Friends", "연인과 함께": "With Partner", "간단한 식사": "Light Meal", "든든한 식사": "Hearty Meal" };
const mealMapZh = { "혼밥": "一人食", "야식": "夜宵", "친구와 함께": "朋友聚会", "연인과 함께": "恋人约会", "간단한 식사": "简单便餐", "든든한 식사": "丰盛正餐" };
const mealMapJa = { "혼밥": "一人ご飯", "야식": "夜食", "친구와 함께": "友達と一緒に", "연인과 함께": "恋人と一緒に", "간단한 식사": "軽食", "든든한 식사": "がっつり食事" };

let selectedGenre = "전체";
let currentMovies = [];

let currentSort = "popularity";
let visibleMovieCount = 20;
const MOVIES_PER_LOAD = 20;

const urlParams = new URLSearchParams(window.location.search);
const ottKey = urlParams.get("ott");
let selectedMeal = urlParams.get("meal") ? decodeURIComponent(urlParams.get("meal")) : "혼밥";

const moviePageTitle = document.getElementById("moviePageTitle");
const moviePageInfo = document.getElementById("moviePageInfo");
const genreTabs = document.querySelectorAll(".genre-tab");
const selectedGenreTitle = document.getElementById("selectedGenreTitle");
const loadingText = document.getElementById("loadingText");
const movieList = document.getElementById("movieList");
const backToMainBtn = document.getElementById("backToMainBtn");

const sortMenuBtn = document.getElementById("sortMenuBtn");
const sortMenu = document.getElementById("sortMenu");
const sortOptions = document.querySelectorAll(".sort-option");
const loadMoreBtn = document.getElementById("loadMoreBtn");

if (!ottKey) {
  const lang = localStorage.getItem("lang") || "ko";
  let msg = "OTT 정보가 없습니다. 메인 화면에서 OTT를 다시 선택해주세요.";
  if (lang === "en") msg = "No OTT info found. Please select an OTT on the main screen.";
  else if (lang === "zh") msg = "未找到 OTT 信息，请在主页重新选择 OTT 平台。";
  else if (lang === "ja") msg = "OTT情報がありません。メイン画面でOTTを再度選択してください。";
  alert(msg);
  window.location.href = "main.html";
}

function applyMovieLanguage() {
  const lang = localStorage.getItem("lang") || "ko";

  let ottDisplay = ottNameMap[ottKey];
  let mealDisplay = selectedMeal;

  if (lang === "en") {
    ottDisplay = ottNameMapEn[ottKey] || "OTT";
    mealDisplay = mealMapEn[selectedMeal] || selectedMeal;
  } else if (lang === "zh") {
    ottDisplay = ottNameMapZh[ottKey] || "OTT";
    mealDisplay = mealMapZh[selectedMeal] || selectedMeal;
  } else if (lang === "ja") {
    ottDisplay = ottNameMapJa[ottKey] || "OTT";
    mealDisplay = mealMapJa[selectedMeal] || selectedMeal;
  }
  
  if (moviePageTitle) {
    if (lang === "ko") moviePageTitle.textContent = `${ottDisplay} 영화`;
    else if (lang === "en") moviePageTitle.textContent = `${ottDisplay} Movies`;
    else if (lang === "zh") moviePageTitle.textContent = `${ottDisplay} 电影`;
    else if (lang === "ja") moviePageTitle.textContent = `${ottDisplay} 映画`;
  }
  
  if (moviePageInfo) {
    if (lang === "ko") moviePageInfo.textContent = `식사 상황: ${mealDisplay} / 상단 장르 버튼을 선택하면 해당 장르의 영화만 표시됩니다.`;
    else if (lang === "en") moviePageInfo.textContent = `Meal Setting: ${mealDisplay} / Select a genre button above to filter movies.`;
    else if (lang === "zh") moviePageInfo.textContent = `用餐场景: ${mealDisplay} / 点击上方类型按钮可筛选相应电影。`;
    else if (lang === "ja") moviePageInfo.textContent = `食事の状況: ${mealDisplay} / 上のジャンルボタンを選択すると、該当する映画が表示されます。`;
  }
  
  if (selectedGenreTitle) {
    const genreKey = getGenreKey(selectedGenre);
    if (lang === "ko") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} 영화`;
    else if (lang === "en") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} Movies`;
    else if (lang === "zh") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} 电影`;
    else if (lang === "ja") selectedGenreTitle.textContent = `${typeof t === 'function' ? t("tab_" + genreKey) : genreKey} 映画`;
  }
}

function getGenreKey(genre) {
  const map = { "전체": "all", "액션": "action", "코미디": "comedy", "드라마": "drama", "로맨스": "romance", "스릴러": "thriller", "애니메이션": "animation" };
  return map[genre] || "all";
}

genreTabs.forEach((tab) => {
  tab.addEventListener("click", async () => {
    selectedGenre = tab.dataset.genre.trim();
    genreTabs.forEach((btn) => btn.classList.remove("selected"));
    tab.classList.add("selected");
    applyMovieLanguage();
    await loadMoviesByGenre(selectedGenre);
  });
});

async function loadMoviesByGenre(genre) {
  if (loadingText) {
    loadingText.classList.remove("hidden");
    loadingText.textContent = typeof t === "function" ? t("loadingText") : "영화 목록을 불러오는 중입니다...";
  }

  movieList.innerHTML = "";

  if (loadMoreBtn) {
    loadMoreBtn.classList.add("hidden");
  }

  visibleMovieCount = MOVIES_PER_LOAD;

  currentMovies = await fetchMoviesFromTMDB(genre);
  renderMovies(currentMovies);
}

async function fetchMoviesFromTMDB(genre) {
  const apiKey = window.CONFIG?.TMDB_API_KEY;
  const baseUrl = window.CONFIG?.TMDB_BASE_URL || "https://api.themoviedb.org/3";

  if (!apiKey) return [];

  const providerId = ottProviderMap[ottKey];
  if (!providerId) return [];

  const genreId = genreIdMap[genre];

  const lang = localStorage.getItem("lang") || "ko";
  const tmdbLangMap = {
    ko: "ko-KR",
    en: "en-US",
    zh: "zh-CN",
    ja: "ja-JP"
  };
  const tmdbLang = tmdbLangMap[lang] || "ko-KR";

  const maxPagesToFetch = 8;
  const allResults = [];

  function buildMovieUrl(page) {
    let url =
      `${baseUrl}/discover/movie` +
      `?api_key=${apiKey}` +
      `&language=${tmdbLang}` +
      `&region=KR` +
      `&watch_region=KR` +
      `&with_watch_providers=${providerId}` +
      `&sort_by=popularity.desc` +
      `&include_adult=false` +
      `&page=${page}`;

    if (genre !== "전체" && genreId) {
      url += `&with_genres=${genreId}`;
    }

    return url;
  }

  try {
    const firstResponse = await fetch(buildMovieUrl(1));

    if (!firstResponse.ok) {
      console.error("TMDB 첫 페이지 요청 실패:", firstResponse.status);
      return [];
    }

    const firstData = await firstResponse.json();
    const totalPages = Math.min(firstData.total_pages || 1, maxPagesToFetch);

    const firstMovies = firstData.results.map((movie) => ({
      id: movie.id,
      title: movie.title || movie.name || "No Title",
      overview: movie.overview || "",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "",
      rating: movie.vote_average || 0,
      popularity: movie.popularity || 0,
      genre: genre,
    }));

    allResults.push(...firstMovies);

    for (let page = 2; page <= totalPages; page++) {
      const response = await fetch(buildMovieUrl(page));

      if (!response.ok) {
        console.error(`${page}페이지 요청 실패:`, response.status);
        continue;
      }

      const data = await response.json();

      const movies = data.results.map((movie) => ({
        id: movie.id,
        title: movie.title || movie.name || "No Title",
        overview: movie.overview || "",
        posterPath: movie.poster_path,
        releaseDate: movie.release_date || "",
        rating: movie.vote_average || 0,
        popularity: movie.popularity || 0,
        genre: genre,
      }));

      allResults.push(...movies);
    }

    return removeDuplicateMovies(allResults);
  } catch (error) {
    console.error("TMDB API 요청 중 오류 발생:", error);
    return [];
  }
}

function removeDuplicateMovies(movies) {
  const movieMap = new Map();

  movies.forEach((movie) => {
    if (!movieMap.has(movie.id)) {
      movieMap.set(movie.id, movie);
    }
  });

  return Array.from(movieMap.values());
}

function sortMovies(movies) {
  const sortedMovies = [...movies];

  if (currentSort === "popularity") {
    sortedMovies.sort((a, b) => b.popularity - a.popularity);
  }

  if (currentSort === "rating") {
    sortedMovies.sort((a, b) => b.rating - a.rating);
  }

  if (currentSort === "latest") {
    sortedMovies.sort((a, b) => {
      const dateA = a.releaseDate || "0000-00-00";
      const dateB = b.releaseDate || "0000-00-00";
      return new Date(dateB) - new Date(dateA);
    });
  }

  if (currentSort === "title") {
    sortedMovies.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  }

  return sortedMovies;
}

function renderMovies(movies) {
  if (loadingText) loadingText.classList.add("hidden");

  if (!movies || movies.length === 0) {
    movieList.innerHTML = `
      <div class="result-card">
        <p><strong>${typeof t === "function" ? t("noMoviesTitle") : "조건에 맞는 영화가 없습니다."}</strong></p>
        <p style="color:#666; margin-top:8px;">
          ${typeof t === "function" ? t("noMoviesDesc") : "다른 장르를 선택하거나 다시 시도해보세요."}
        </p>
      </div>
    `;

    if (loadMoreBtn) {
      loadMoreBtn.classList.add("hidden");
    }

    return;
  }

  const sortedMovies = sortMovies(movies);
  const visibleMovies = sortedMovies.slice(0, visibleMovieCount);

  movieList.innerHTML = visibleMovies.map((movie, index) => {
    const posterUrl = movie.posterPath ? `https://image.tmdb.org/t/p/w300${movie.posterPath}` : "";
    const titleText = movie.title !== "No Title" ? movie.title : (typeof t === "function" ? t("noTitle") : "제목 없음");
    const releaseText = movie.releaseDate ? movie.releaseDate : (typeof t === "function" ? t("noReleaseInfo") : "정보 없음");
    const ratingText = movie.rating ? movie.rating.toFixed(1) : (typeof t === "function" ? t("noRatingInfo") : "정보 없음");

    return `
      <div class="movie-card" data-index="${index}" style="cursor: pointer;">
        <div class="movie-poster-area">
          ${posterUrl ? `<img src="${posterUrl}" alt="Poster" class="movie-poster">` : `<div class="no-poster">No Image</div>`}
        </div>

        <div class="movie-info">
          <strong>${titleText}</strong>
          <p>${typeof t === "function" ? t("releaseDate") : "개봉일"}: ${releaseText}</p>
          <p>${typeof t === "function" ? t("rating") : "평점"}: ${ratingText}</p>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = Number(card.dataset.index);
      const selectedMovie = visibleMovies[idx];

      const mealParam = encodeURIComponent(selectedMeal);
      const genreParam = encodeURIComponent(selectedGenre);

      window.location.href =
        `recommend.html?movieId=${selectedMovie.id}` +
        `&ott=${ottKey}` +
        `&meal=${mealParam}` +
        `&genre=${genreParam}`;
    });
  });

  if (loadMoreBtn) {
    if (visibleMovieCount < sortedMovies.length) {
      loadMoreBtn.classList.remove("hidden");
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = `더보기 (${visibleMovies.length}/${sortedMovies.length})`;
    } else {
      loadMoreBtn.classList.remove("hidden");
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = `모든 영화를 확인했습니다 (${sortedMovies.length}개)`;
    }
  }
}

function saveToHistory(movieTitle, foodName, emoji) {
  let history = JSON.parse(localStorage.getItem("matchHistory")) || [];
  const newRecord = {
    date: new Date().toLocaleString(),
    movieTitle: movieTitle,
    foodName: foodName,
    emoji: emoji
  };
  
  history.unshift(newRecord);
  if (history.length > 20) history.pop();
  localStorage.setItem("matchHistory", JSON.stringify(history));
}

function showFinalResultModal(movie) {
  const modal = document.getElementById("finalResultModal");
  if (!modal) return;

  const lang = localStorage.getItem("lang") || "ko";
  const foodRec = recommendFood(selectedGenre);
  
  document.getElementById("modalResultTitle").textContent = typeof t === 'function' ? t("modalResultTitle") : "✨ 맞춤 추천 결과 ✨";
  document.getElementById("modalMovieHeader").textContent = typeof t === 'function' ? t("modalMovieHeader") : "🎬 선택한 영화";
  document.getElementById("modalFoodHeader").textContent = typeof t === 'function' ? t("modalFoodHeader") : "🍽 추천 음식";

  const posterEl = document.getElementById("modalMoviePoster");
  if (movie.posterPath) {
     posterEl.src = `https://image.tmdb.org/t/p/w300${movie.posterPath}`;
     posterEl.style.display = "block";
  } else {
     posterEl.style.display = "none";
  }
  document.getElementById("modalMovieTitle").textContent = movie.title;
  
  let emoji = "🍽️";
  const fName = foodRec[lang].name;
  if (fName.includes("치킨") || fName.includes("Chicken") || fName.includes("炸鸡") || fName.includes("チキン")) emoji = "🍗";
  else if (fName.includes("피자") || fName.includes("Pizza") || fName.includes("披萨") || fName.includes("ピザ")) emoji = "🍕";
  else if (fName.includes("떡볶이") || fName.includes("Tteokbokki") || fName.includes("辣炒年糕") || fName.includes("トッポッキ")) emoji = "🥘";
  else if (fName.includes("우동") || fName.includes("Noodles") || fName.includes("乌冬面") || fName.includes("うどん")) emoji = "🍜";
  else if (fName.includes("파스타") || fName.includes("Pasta") || fName.includes("意面") || fName.includes("パスタ")) emoji = "🍝";
  else if (fName.includes("햄버거") || fName.includes("Burger") || fName.includes("汉堡") || fName.includes("ハンバーガー")) emoji = "🍔";

  document.getElementById("modalFoodEmoji").textContent = emoji;
  document.getElementById("modalFoodName").textContent = foodRec[lang].name;
  document.getElementById("modalFoodReason").textContent = foodRec[lang].reason;

  modal.classList.remove("hidden");
  modal.style.display = "flex"; 

  saveToHistory(movie.title, fName, emoji);
}

const closeFinalResultModal = document.getElementById("closeFinalResultModal");
if (closeFinalResultModal) {
  closeFinalResultModal.addEventListener("click", () => {
    const modal = document.getElementById("finalResultModal");
    modal.classList.add("hidden");
    modal.style.display = "none";
  });
}

const modalShareBtn = document.getElementById("modalShareBtn");
if (modalShareBtn) {
  modalShareBtn.addEventListener("click", async () => {
    const captureArea = document.getElementById("resultCaptureArea");
    const isDark = document.body.classList.contains("dark-mode");
    captureArea.style.backgroundColor = isDark ? "#222222" : "#ffffff";
    
    try {
      if (typeof html2canvas !== "undefined") {
        const canvas = await html2canvas(captureArea, { scale: 2, useCORS: true });
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Movie_Food_Result.png";
        link.click();
        alert(typeof t === 'function' ? t("alert_copied") : "결과가 저장되었습니다!");
      } else {
        alert("html2canvas 라이브러리가 로드되지 않았습니다.");
      }
    } catch (error) {
      alert("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      captureArea.style.backgroundColor = "transparent";
    }
  });
}

function recommendFood(genre) {
  const foodRules = {
    "전체": { ko: { name: "치킨 + 콜라", reason: "OTT를 보면서 먹기 편하고 대부분의 영화와 무난하게 어울리는 조합입니다." }, en: { name: "Chicken + Cola", reason: "Easy to eat while watching OTT and pairs well with most movies overall." }, zh: { name: "炸鸡 + 可乐", reason: "边看视频边吃很方便，和绝大多数电影都很百搭。" }, ja: { name: "チキン + コーラ", reason: "OTTを見ながら食べやすく、ほとんどの映画に無難に合う組み合わせです。" } },
    "스릴러": { ko: { name: "피자 + 콜라", reason: "스릴러 영화는 긴장감이 강하기 때문에 화면에 집중하면서 간단히 집어 먹을 수 있는 피자가 잘 어울립니다." }, en: { name: "Pizza + Cola", reason: "Since thriller movies are highly intense, pizza is perfect to grab easily while staying focused on the screen." }, zh: { name: "披萨 + 可乐", reason: "惊悚片节奏紧张，最适合边盯着屏幕边随手拿着吃的披萨。" }, ja: { name: "ピザ + コーラ", reason: "スリラー映画は緊張感が強いため、画面に集中しながら簡単に手で食べられるピザがよく合います。" } },
    "코미디": { ko: { name: "떡볶이 + 튀김", reason: "코미디 영화의 가볍고 즐거운 분위기에는 부담 없이 먹기 좋은 분식 조합이 잘 어울립니다." }, en: { name: "Tteokbokki + Fried Sides", reason: "The light and fun mood of comedy movies pairs perfectly with casual Korean street food." }, zh: { name: "辣炒年糕 + 炸物", reason: "喜剧片轻松愉快的氛围，与无负担、易入口的韩式街头小吃是绝配。" }, ja: { name: "トッポッキ + 揚げ物", reason: "コメディ映画の軽くて楽しい雰囲気には、気軽に食べられる粉食の組み合わせがよく合います。" } },
    "드라마": { ko: { name: "우동", reason: "드라마 영화의 잔잔한 감정선과 따뜻한 국물 음식이 잘 어울립니다." }, en: { name: "Udon Noodles", reason: "The calm emotional storyline of drama movies pairs beautifully with warm, soothing noodle soup." }, zh: { name: "乌冬面", reason: "剧情片细腻动人的情感路线，与温暖、治愈的汤面非常契合。" }, ja: { name: "うどん", reason: "ドラマ映画の穏やかな感情線と温かいスープ料理がよく合います。" } },
    "로맨스": { ko: { name: "파스타 + 샐러드", reason: "로맨스 영화의 부드러운 분위기에는 깔끔하고 분위기 있는 음식이 잘 어울립니다." }, en: { name: "Pasta + Salad", reason: "The sweet and gentle mood of romance movies matches well with elegant, clean dishes." }, zh: { name: "意面 + 沙拉", reason: "爱情片浪漫温柔的氛围，适合搭配精致、有情调的料理。" }, ja: { name: "パスタ + サラダ", reason: "ロマンス映画の柔らかい雰囲気には、すっきりとした雰囲気のある料理がよく合います。" } },
    "액션": { ko: { name: "치킨 + 감자튀김", reason: "액션 영화의 빠르고 강한 분위기에는 든든하고 자극적인 음식이 잘 어울립니다." }, en: { name: "Chicken + French Fries", reason: "The fast and powerful vibe of action movies pairs great with satisfying and savory foods." }, zh: { name: "炸鸡 + 炸薯条", reason: "动作片节奏快、冲击力强，最适合搭配管饱且重口味的高热量美食。" }, ja: { name: "チキン + フライドポテト", reason: "アクション映画の速くて力強い雰囲気には、ボリュームたっぷりで刺激ঠিで刺激的な食べ物がよく合います。" } },
    "애니메이션": { ko: { name: "햄버거 세트", reason: "애니메이션은 편하게 보기 좋은 경우가 많아서 간단하고 대중적인 햄버거 세트가 잘 어울립니다." }, en: { name: "Burger Combo", reason: "Animations are usually easy to enjoy, making a simple and popular burger set an excellent choice." }, zh: { name: "汉堡套餐", reason: "看动画片通常非常放松，搭配简单且大众化的汉堡套餐是个极佳的选择。" }, ja: { name: "ハンバーガーセット", reason: "アニメはリラックスして見やすいことが多いので、シンプルでポピュラーなハンバーガーセットがよく合います。" } }
  };
  return foodRules[genre] || foodRules["전체"];
}

if (backToMainBtn) {
  backToMainBtn.addEventListener("click", () => { window.location.href = "main.html"; });
}

document.addEventListener("languageChanged", () => {
  applyMovieLanguage();
  renderMovies(currentMovies);
});

const settingBtn = document.getElementById("settingBtn");
const settingPopup = document.getElementById("settingPopup");
if (settingBtn && settingPopup) {
  settingBtn.addEventListener("click", (e) => { e.stopPropagation(); settingPopup.classList.toggle("hidden"); });
  document.addEventListener("click", () => { if (settingPopup) settingPopup.classList.add("hidden"); });
}

const historyBtn = document.getElementById("historyBtn");
const historyModal = document.getElementById("historyModal");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyListContainer = document.getElementById("historyListContainer");

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("matchHistory")) || [];
  
  if (history.length === 0) {
    historyListContainer.innerHTML = `<div class="empty-history">${typeof t === 'function' ? t("emptyHistory") : "기록이 없습니다."}</div>`;
    return;
  }

  historyListContainer.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-item-emoji">${item.emoji}</div>
      <div class="history-item-info">
        <small>${item.date}</small>
        <strong>🎬 ${item.movieTitle}</strong>
        <p>${item.foodName}</p>
      </div>
    </div>
  `).join("");
}

if (historyBtn && historyModal) {
  historyBtn.addEventListener("click", () => {
    renderHistory();
    historyModal.classList.remove("hidden");
    historyModal.style.display = "flex";
  });
}

if (closeHistoryBtn) {
  closeHistoryBtn.addEventListener("click", () => {
    historyModal.classList.add("hidden");
    historyModal.style.display = "none";
  });
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    if(confirm((typeof getLang === 'function' && getLang() === "ko") ? "기록을 모두 지우시겠습니까?" : "Clear all history?")) {
      localStorage.removeItem("matchHistory");
      renderHistory();
    }
  });
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    visibleMovieCount += MOVIES_PER_LOAD;
    renderMovies(currentMovies);
  });
}

if (sortMenuBtn && sortMenu) {
  sortMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    sortMenu.classList.toggle("hidden");
  });

  sortMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    sortMenu.classList.add("hidden");
  });
}

sortOptions.forEach((option) => {
  option.addEventListener("click", () => {
    currentSort = option.dataset.sort;

    if (currentSort === "popularity") sortMenuBtn.textContent = "인기순 ▾";
    if (currentSort === "rating") sortMenuBtn.textContent = "평점순 ▾";
    if (currentSort === "latest") sortMenuBtn.textContent = "최신순 ▾";
    if (currentSort === "title") sortMenuBtn.textContent = "이름순 ▾";

    sortMenu.classList.add("hidden");
    visibleMovieCount = MOVIES_PER_LOAD;
    renderMovies(currentMovies);
  });
});

applyMovieLanguage();
loadMoviesByGenre(selectedGenre);

