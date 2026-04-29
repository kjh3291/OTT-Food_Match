///////////////////////////////////
// 문자열 리스트 → 객체로 변환
//////////////////////////////////
export function convertFoods(foodNames, category) {
  return foodNames.map(name => ({
    name,
    category,
    weight: 1,
    likes: 0,
    dislikes: 0,
    lastShownAt: null
  }));
}

///////////////////////////////////
// 가중치 기반 랜덤 선택 함수
//////////////////////////////////
export function weightedRandom(foods) {
  const totalWeight = foods.reduce((sum, f) => sum + f.weight, 0);
  let random = Math.random() * totalWeight;

  for (const food of foods) {
    if (random < food.weight) return food;
    random -= food.weight;
  }
}