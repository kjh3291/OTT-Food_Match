import { FOOD_NAME_TO_CATEGORY } from "./food-data.js";
 
// =====================================================================
// 🧑‍🍳 사용자 개인화 모듈
//  - 흩어진 사용자 신호(저장 조합 / 좋아요·싫어요 / 매칭 기록)를
//    "취향 프로필" 하나로 정제한다.
//  - ai-recommend.js, match-reason.js 가 공유해서 일관된 개인화를 한다.
// =====================================================================
 
// 빈도 카운트 → [{ key, count }] 내림차순
function countTop(items, max = 5) {
  const map = {};
  items.filter(Boolean).forEach((v) => {
    map[v] = (map[v] || 0) + 1;
  });
  return Object.entries(map)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, max);
}

/**
 * 사용자 신호로부터 취향 프로필을 만든다.
 * @param {Object} params
 * @param {Array} params.savedCombos        - 저장한 조합 (긍정 신호)
 * @param {Array} params.recommendReactions - 좋아요/싫어요 기록
 * @param {Array} params.matchHistory       - 최근 매칭 기록(보조 신호)
 */
export function buildUserProfile({
  savedCombos = [],
  recommendReactions = [],
  matchHistory = [],
} = {}) {
  // --- 카테고리 점수 (저장=+2, 좋아요=+3, 싫어요=-3) ---
  const categoryScore = {};
  const addCat = (cat, n) => {
    if (!cat || !n) return;
    categoryScore[cat] = (categoryScore[cat] || 0) + n;
  };
 
  savedCombos.forEach((c) => addCat(FOOD_NAME_TO_CATEGORY[c.foodName], 2));
  recommendReactions.forEach((r) => {
    const delta = r.reaction === "like" ? 3 : r.reaction === "dislike" ? -3 : 0;
    addCat(FOOD_NAME_TO_CATEGORY[r.foodName], delta);
  });
 
  const preferredCategories = Object.entries(categoryScore)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category, score]) => ({ category, score }));
 
  const avoidCategories = Object.entries(categoryScore)
    .filter(([, score]) => score < 0)
    .sort((a, b) => a[1] - b[1])
    .map(([category]) => category);