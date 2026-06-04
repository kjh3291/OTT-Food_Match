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