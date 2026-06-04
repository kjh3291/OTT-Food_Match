// recommend-utils.js
// recommend.js에서 순수 함수만 분리 (DOM/fetch 제외)

const { convertFoods, recommend } = require('./food-algorithm.js');
const { meals, desserts, fastfoods } = require('./food.js');

const mealData     = convertFoods(meals,     "식사");
const dessertData  = convertFoods(desserts,  "디저트");
const fastfoodData = convertFoods(fastfoods, "패스트푸드");
const allFoods     = [...mealData, ...dessertData, ...fastfoodData];

function getCategoriesFromGenre(genre) {
  switch (genre) {
    case "액션":      return ["패스트푸드", "식사"];
    case "코미디":    return ["식사"];
    case "드라마":    return ["디저트"];
    case "로맨스":    return ["디저트"];
    case "스릴러":    return ["패스트푸드"];
    case "애니메이션": return ["패스트푸드", "디저트"];
    default:          return ["식사", "패스트푸드", "디저트"];
  }
}

function getFoodsByCategories(categories) {
  return allFoods.filter(food => categories.includes(food.category));
}

function makeRecommendReason(genre, meal, foodName) {
  let reason = "";

  if (genre === "액션") {
    reason += "액션 영화는 빠른 전개와 강한 몰입감이 특징입니다. ";
    reason += `${foodName}은 영화에 집중하면서 먹기 좋고, 자극적인 분위기와 잘 어울립니다. `;
  } else if (genre === "코미디") {
    reason += "코미디 영화는 가볍고 즐거운 분위기가 중요합니다. ";
    reason += `${foodName}은 부담 없이 먹기 좋아서 편안한 감상 분위기를 만들어줍니다. `;
  } else if (genre === "드라마") {
    reason += "드라마 영화는 감정선과 몰입감이 중요한 장르입니다. ";
    reason += `${foodName}은 차분한 분위기에서 영화를 보기 좋게 만들어줍니다. `;
  } else if (genre === "로맨스") {
    reason += "로맨스 영화는 부드럽고 감성적인 분위기가 중요합니다. ";
    reason += `${foodName}은 분위기를 해치지 않고 깔끔하게 즐기기 좋습니다. `;
  } else if (genre === "스릴러") {
    reason += "스릴러 영화는 긴장감이 강하고 화면 집중도가 높은 장르입니다. ";
    reason += `${foodName}은 간단히 먹을 수 있어 영화 흐름을 방해하지 않습니다. `;
  } else if (genre === "애니메이션") {
    reason += "애니메이션은 편하게 즐기기 좋은 경우가 많습니다. ";
    reason += `${foodName}은 가볍게 먹기 좋아서 캐주얼한 감상에 잘 어울립니다. `;
  } else {
    reason += "전체 장르에서는 부담 없이 즐길 수 있는 음식 조합이 좋습니다. ";
    reason += `${foodName}은 다양한 영화와 무난하게 어울리는 메뉴입니다. `;
  }

  if (meal === "혼밥") {
    reason += "또한 혼밥 상황에서는 혼자 먹기 편하고 준비 부담이 적은 음식이 적합합니다.";
  } else if (meal === "야식") {
    reason += "또한 야식 상황에서는 너무 복잡하지 않고 편하게 먹을 수 있는 음식이 잘 맞습니다.";
  } else if (meal === "친구와 함께") {
    reason += "또한 친구와 함께 볼 때는 나눠 먹기 좋은 음식일수록 만족도가 높아집니다.";
  } else if (meal === "연인과 함께") {
    reason += "또한 연인과 함께라면 분위기를 해치지 않고 깔끔하게 먹을 수 있는 조합이 좋습니다.";
  } else if (meal === "간단한 식사") {
    reason += "또한 간단한 식사 상황이기 때문에 부담 없이 먹을 수 있는 메뉴가 잘 어울립니다.";
  } else if (meal === "든든한 식사") {
    reason += "또한 든든한 식사가 필요한 상황이므로 포만감 있는 메뉴가 더 잘 어울립니다.";
  }

  return reason;
}

module.exports = {
  allFoods,
  getCategoriesFromGenre,
  getFoodsByCategories,
  makeRecommendReason,
};
