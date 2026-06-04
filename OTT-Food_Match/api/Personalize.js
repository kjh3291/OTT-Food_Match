import { FOOD_NAME_TO_CATEGORY } from "./food_data.js";
 
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

    // --- 좋아요/싫어요 음식 ---
  const likedFoods = [
    ...new Set([
      ...recommendReactions.filter((r) => r.reaction === "like").map((r) => r.foodName),
      ...savedCombos.map((c) => c.foodName),
    ]),
  ].filter(Boolean);
 
  const dislikedFoods = [
    ...new Set(
      recommendReactions.filter((r) => r.reaction === "dislike").map((r) => r.foodName)
    ),
  ].filter(Boolean);

  // --- 자주 고른 장르 / 식사 상황 / OTT ---
  const favoriteGenres = countTop([
    ...savedCombos.map((c) => c.genre),
    ...recommendReactions.map((r) => r.genre),
  ]);
 
  const favoriteMeals = countTop([
    ...savedCombos.map((c) => c.meal),
    ...recommendReactions.map((r) => r.meal),
  ]);
 
  const favoriteOtt = countTop([
    ...savedCombos.map((c) => c.ott),
    ...recommendReactions.map((r) => r.ott),
  ]);

  // --- 자주 저장/선택한 음식 ---
  const topFoods = countTop([
    ...savedCombos.map((c) => c.foodName),
    ...matchHistory.map((h) => h.foodName),
  ]);
 
  const signalCount =
    savedCombos.length + recommendReactions.length + matchHistory.length;
 
  return {
    hasData: signalCount >= 2, // 신호가 2개 이상이면 개인화 가능
    signalCount,
    preferredCategories,
    avoidCategories,
    likedFoods,
    dislikedFoods,
    favoriteGenres,
    favoriteMeals,
    favoriteOtt,
    topFoods,
  };
}

/**
 * 취향 프로필을 프롬프트에 넣기 좋은 한국어 텍스트로 변환한다.
 */
export function formatProfileForPrompt(profile) {
  if (!profile || !profile.hasData) {
    return [
      "[사용자 취향 프로필]",
      "- 아직 누적된 취향 데이터가 거의 없음 (개인화 신호 부족).",
      "- 무난하고 보편적인 조합 위주로 추천하되, 사용을 이어가면 점점 더 개인화된다는 점을 자연스럽게 한 문장으로 녹여라.",
    ].join("\n");
  }
 
  const lines = ["[사용자 취향 프로필]"];
 
  if (profile.preferredCategories.length > 0) {
    lines.push(
      "- 선호 카테고리(점수 높을수록 강함): " +
        profile.preferredCategories
          .map((c) => `${c.category}(${c.score})`)
          .join(", ")
    );
  }
  if (profile.avoidCategories.length > 0) {
    lines.push("- 피하는 편인 카테고리: " + profile.avoidCategories.join(", "));
  }
  if (profile.likedFoods.length > 0) {
    lines.push("- 좋아요/저장한 음식: " + profile.likedFoods.slice(0, 8).join(", "));
  }
  if (profile.dislikedFoods.length > 0) {
    lines.push("- 싫어요 누른 음식(피할 것): " + profile.dislikedFoods.join(", "));
  }
  if (profile.favoriteGenres.length > 0) {
    lines.push(
      "- 자주 고른 장르: " +
        profile.favoriteGenres.map((g) => `${g.key}(${g.count}회)`).join(", ")
    );
  }
  if (profile.favoriteMeals.length > 0) {
    lines.push(
      "- 자주 고른 식사 상황: " +
        profile.favoriteMeals.map((m) => `${m.key}(${m.count}회)`).join(", ")
    );
  }
  if (profile.favoriteOtt.length > 0) {
    lines.push(
      "- 자주 본 OTT: " + profile.favoriteOtt.map((o) => o.key).join(", ")
    );
  }
  if (profile.topFoods.length > 0) {
    lines.push(
      "- 특히 자주 고른 음식: " +
        profile.topFoods.map((f) => f.key).join(", ")
    );
  }
 
  return lines.join("\n");
}
 