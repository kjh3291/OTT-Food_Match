const { foodCategories, getFoodsByCategory, getFoodsByCategories, convertFoods } = require('./food-data');

describe('foodCategories 데이터', () => {
  test('7개 카테고리를 가진다', () => {
    expect(Object.keys(foodCategories)).toEqual(['한식', '중식', '일식', '양식', '패스트푸드', '디저트', '치킨']);
  });
  test('각 카테고리는 비어있지 않다', () => {
    Object.values(foodCategories).forEach(arr => expect(arr.length).toBeGreaterThan(0));
  });
});

describe('getFoodsByCategory', () => {
  test('존재하는 카테고리의 음식 배열을 반환한다', () => {
    expect(getFoodsByCategory('치킨')).toContain('양념치킨');
  });
  test('없는 카테고리는 빈 배열을 반환한다', () => {
    expect(getFoodsByCategory('우주식')).toEqual([]);
  });
  test('원본을 복사해 반환한다(참조 분리)', () => {
    const a = getFoodsByCategory('중식');
    a.push('변조');
    expect(getFoodsByCategory('중식')).not.toContain('변조');
  });
});

describe('getFoodsByCategories', () => {
  test('여러 카테고리를 합쳐 {name,category} 객체로 반환한다', () => {
    const r = getFoodsByCategories(['중식', '치킨']);
    r.forEach(f => expect(['중식', '치킨']).toContain(f.category));
    expect(r.length).toBeGreaterThan(0);
  });
  test('없는 카테고리면 빈 배열', () => {
    expect(getFoodsByCategories(['없음'])).toEqual([]);
  });
});


describe('convertFoods', () => {
  test('문자열 배열을 객체 배열로 변환', () => {
    expect(convertFoods(['짜장면'], '중식')).toEqual([{ name: '짜장면', category: '중식' }]);
  });
});