///////////////////////////////////
// 문자열 리스트 → 객체로 변환
//////////////////////////////////
function convertFoods(foodArray, category) {
  return foodArray.map(food => ({
    name: food,
    category: category,
    /*
    weight: 1,
    likes: 0,
    dislikes: 0,
    lastShownAt: null
    */
  }));
}
/*
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
*/
///////////////////////////////////
// 이전 추천과 중복 방지
//////////////////////////////////
function recommend(foods) {
/*
  do {
    result = weightedRandom(foods);
  } while (lastFood && result.name === lastFood.name);

  result.lastShownAt = Date.now();
  return result;
  */
  const randomIndex = Math.floor(Math.random() * foods.length);

  return foods[randomIndex];
}
/*
///////////////////////////////////
// 좋아요 및 싫어요 처리
//////////////////////////////////
export function like(food) {
  food.likes++;
  food.weight = Math.min(5, food.weight + 0.2);
}

export function dislike(food) {
  food.dislikes++;
  food.weight = Math.max(0.1, food.weight - 0.2);
}
*/

