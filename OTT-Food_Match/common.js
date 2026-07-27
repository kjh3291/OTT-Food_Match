// 공통 유틸리티 (모든 페이지에서 import해서 사용)

export function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "custom-toast";
  toast.innerHTML = `<span>⚠️</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export function initDarkMode() {
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
  const toggle = document.getElementById("darkModeToggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    if (typeof applyLanguage === "function") applyLanguage();
    document.dispatchEvent(new Event("languageChanged"));
  });
}

export function initSettingsPopup() {
  const btn = document.getElementById("settingBtn");
  const popup = document.getElementById("settingPopup");
  if (!btn || !popup) return;
  btn.addEventListener("click", (e) => { e.stopPropagation(); popup.classList.toggle("hidden"); });
  popup.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => popup.classList.add("hidden"));
}

export function getTmdbLang() {
  const map = { ko: "ko-KR", en: "en-US", zh: "zh-CN", ja: "ja-JP" };
  return map[localStorage.getItem("lang") || "ko"] || "ko-KR";
}
