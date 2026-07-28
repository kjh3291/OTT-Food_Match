import { auth, db } from './firebase.js';
import { showToast, initDarkMode, initSettingsPopup } from './common.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

initSettingsPopup();
initDarkMode();

const ottNameMap = { netflix: "Netflix", disney: "Disney+", tving: "TVING", wavve: "wavve" };

function getMostFrequent(arr) {
  if (!arr.length) return null;
  const freq = {};
  arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

function renderProfile(user) {
  document.getElementById("profileName").textContent = user.displayName || "사용자";
  document.getElementById("profileEmail").textContent = user.email || "";

  const photo = document.getElementById("profilePhoto");
  const fallback = document.getElementById("profilePhotoFallback");
  if (user.photoURL) {
    photo.src = user.photoURL;
    photo.style.display = "block";
    fallback.style.display = "none";
  }
}

function renderStats(savedCombos, reactions) {
  document.getElementById("statSaved").textContent = savedCombos.length;
  document.getElementById("statLike").textContent = reactions.filter(r => r.reaction === "like").length;
  document.getElementById("statDislike").textContent = reactions.filter(r => r.reaction === "dislike").length;

  const favOtt = getMostFrequent(savedCombos.map(c => ottNameMap[c.ott] || c.ott));
  const favFood = getMostFrequent(savedCombos.map(c => c.foodName));
  const favGenre = getMostFrequent(savedCombos.map(c => c.genre).filter(g => g && g !== "전체"));

  document.getElementById("favOtt").textContent = favOtt || "—";
  document.getElementById("favFood").textContent = favFood || "—";
  document.getElementById("favGenre").textContent = favGenre || "—";
}

function renderComboList(savedCombos) {
  const list = document.getElementById("mypageComboList");
  if (!savedCombos.length) {
    list.innerHTML = `<div class="saved-empty-card"><div class="saved-empty-icon">🍿</div><h3>아직 저장한 조합이 없어요</h3><p>영화 추천 페이지에서 마음에 드는 조합을 저장해보세요.</p></div>`;
    return;
  }

  const sorted = [...savedCombos].reverse();
  list.innerHTML = sorted.map(combo => {
    const poster = combo.posterPath ? `https://image.tmdb.org/t/p/w200${combo.posterPath}` : "";
    const date = combo.savedAt ? new Date(combo.savedAt).toLocaleDateString("ko-KR") : "";
    return `
      <div class="mypage-combo-item" data-movie-id="${combo.movieId}" data-ott="${combo.ott}" data-meal="${encodeURIComponent(combo.meal||'')}" data-genre="${encodeURIComponent(combo.genre||'전체')}" data-food-name="${encodeURIComponent(combo.foodName||'')}" data-food-category="${encodeURIComponent(combo.foodCategory||'기타')}" data-reason="${encodeURIComponent(combo.reason||'')}">
        <div class="mypage-combo-poster">
          ${poster ? `<img src="${poster}" alt="${combo.movieTitle}" />` : `<div class="mypage-combo-no-poster">🎬</div>`}
        </div>
        <div class="mypage-combo-info">
          <strong>${combo.movieTitle || "제목 없음"}</strong>
          <p>🍽 ${combo.foodName}</p>
          <p class="mypage-combo-meta">${ottNameMap[combo.ott] || combo.ott} · ${combo.meal} · ${date}</p>
        </div>
        <span class="mypage-combo-arrow">›</span>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".mypage-combo-item").forEach(item => {
    item.addEventListener("click", () => {
      const url = `recommend.html?movieId=${item.dataset.movieId}&ott=${item.dataset.ott}&meal=${item.dataset.meal}&genre=${item.dataset.genre}&mode=saved&foodName=${item.dataset.foodName}&foodCategory=${item.dataset.foodCategory}&reason=${item.dataset.reason}`;
      window.location.href = url;
    });
  });
}

async function syncAndRender(user) {
  try {
    const q = query(collection(db, "savedCombos"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const combos = [];
    snap.forEach(doc => combos.push({ docId: doc.id, ...doc.data() }));
    combos.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
    localStorage.setItem("savedCombos", JSON.stringify(combos));
  } catch (e) {
    console.error("동기화 실패:", e);
  }

  const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
  const reactions = JSON.parse(localStorage.getItem("recommendReactions")) || [];

  renderStats(savedCombos, reactions);
  renderComboList(savedCombos);
}

onAuthStateChanged(auth, async (user) => {
  const loginRequired = document.getElementById("mypageLoginRequired");
  const content = document.getElementById("mypageContent");

  if (!user) {
    loginRequired.style.display = "block";
    content.style.display = "none";
    return;
  }

  loginRequired.style.display = "none";
  content.style.display = "block";

  renderProfile(user);
  await syncAndRender(user);
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  showToast("로그아웃 되었습니다.");
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
});
