// recommend-match-utils.js — recommend.js의 7개 카테고리 매칭 순수 함수만 복사
const { foodCategories } = require('./food-data.js');

function getGenreFromFoodCategory(category) {
  if (!category) return "전체";
  const cat = category.toLowerCase();
  if (cat.includes("디저트") || cat.includes("카페")) return "로맨스";
  if (cat.includes("치킨") || cat.includes("패스트푸드") || cat.includes("야식")) return "액션";
  if (cat.includes("중식")) return "코미디";
  if (cat.includes("한식") || cat.includes("일식") || cat.includes("양식") || cat.includes("초밥")) return "드라마";
  return "전체";
}

function getCategoriesForSituation(genre, meal) {
  let tags = [];
  if (genre === "액션") tags = ["치킨", "패스트푸드", "중식"];
  else if (genre === "코미디") tags = ["패스트푸드", "치킨", "중식"];
  else if (genre === "드라마") tags = ["한식", "일식", "양식"];
  else if (genre === "로맨스") tags = ["양식", "디저트"];
  else if (genre === "스릴러") tags = ["치킨", "패스트푸드"];
  else if (genre === "애니메이션") tags = ["디저트", "패스트푸드"];
  else tags = Object.keys(foodCategories);

  if (meal === "야식") tags.push("치킨", "패스트푸드", "중식");
  else if (meal === "간단한 식사") tags.push("패스트푸드", "디저트");
  else if (meal === "든든한 식사") tags.push("한식", "중식", "일식", "양식");
  else if (meal === "디저트") tags.push("디저트");

  return [...new Set(tags)];
}

module.exports = { getGenreFromFoodCategory, getCategoriesForSituation };
