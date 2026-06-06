// i18n-utils.js — i18n.js의 getLang/t 로직 복사 (applyLanguage 등 DOM 함수는 제외)
// 참고: 원본 i18nData는 매우 크므로 테스트용 대표 키만 옮겨둠. 로직은 원본과 동일.
const i18nData = {
  ko: { settingBtn: "⚙ 설정", tab_action: "액션", tab_all: "전체", mins: "분" },
  en: { settingBtn: "⚙ Settings", tab_action: "Action", tab_all: "All", mins: " min" },
  zh: { settingBtn: "⚙ 设置", tab_action: "动作", tab_all: "全部", mins: "分钟" },
  ja: { settingBtn: "⚙ 設定", tab_action: "アクション", tab_all: "すべて", mins: "分" }
};

function getLang() { return localStorage.getItem("lang") || "ko"; }
function t(key) { return i18nData[getLang()][key] || key; }

module.exports = { i18nData, getLang, t };
