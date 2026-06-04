// food-algorithm.js (원본 동일, module.exports 추가)

function convertFoods(foodArray, category) {
  return foodArray.map(food => ({
    name: food,
    category: category,
  }));
}

function recommend(foods) {
  if (!foods || foods.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * foods.length);
  return foods[randomIndex];
}

module.exports = { convertFoods, recommend };
