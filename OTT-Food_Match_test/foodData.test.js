const { foodCategories, getFoodsByCategory, getFoodsByCategories, convertFoods } = require('./food-data');

describe('foodCategories 데이터', () => {
  test('7개 카테고리를 가진다', () => {
    expect(Object.keys(foodCategories)).toEqual(['한식', '중식', '일식', '양식', '패스트푸드', '디저트', '치킨']);
  });
  test('각 카테고리는 비어있지 않다', () => {
    Object.values(foodCategories).forEach(arr => expect(arr.length).toBeGreaterThan(0));
  });
});

