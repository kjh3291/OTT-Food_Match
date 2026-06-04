/**
 * test_foodAlgorithm.js
 * food-algorithm.js 에 대한 Jest Unit Test
 */

const { convertFoods, recommend } = require('../OTT-Food_Match/src/food-algorithm');

// ─────────────────────────────────────────────
// convertFoods
// ─────────────────────────────────────────────
describe('convertFoods', () => {
  test('음식 배열을 {name, category} 객체 배열로 변환한다', () => {
    const result = convertFoods(['김치찌개', '된장찌개'], '식사');
    expect(result).toEqual([
      { name: '김치찌개', category: '식사' },
      { name: '된장찌개', category: '식사' },
    ]);
  });

  test('모든 항목에 category가 올바르게 할당된다', () => {
    const result = convertFoods(['케이크', '마카롱'], '디저트');
    result.forEach(item => {
      expect(item.category).toBe('디저트');
    });
  });

  test('빈 배열을 넘기면 빈 배열을 반환한다', () => {
    expect(convertFoods([], '식사')).toEqual([]);
  });

  test('단일 항목도 정상 변환된다', () => {
    const result = convertFoods(['햄버거'], '패스트푸드');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: '햄버거', category: '패스트푸드' });
  });
});

// ─────────────────────────────────────────────
// recommend
// ─────────────────────────────────────────────
describe('recommend', () => {
  const foods = [
    { name: '김치찌개', category: '식사' },
    { name: '된장찌개', category: '식사' },
    { name: '비빔밥',   category: '식사' },
  ];

  test('음식 목록에서 항목 하나를 반환한다', () => {
    const result = recommend(foods);
    expect(result).toBeDefined();
    expect(foods).toContainEqual(result);
  });

  test('반환된 항목은 name과 category를 가진다', () => {
    const result = recommend(foods);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('category');
  });

  test('빈 배열이면 null을 반환한다', () => {
    expect(recommend([])).toBeNull();
  });

  test('null/undefined이면 null을 반환한다', () => {
    expect(recommend(null)).toBeNull();
    expect(recommend(undefined)).toBeNull();
  });

  test('단일 항목 배열이면 항상 그 항목을 반환한다', () => {
    const single = [{ name: '라면', category: '식사' }];
    expect(recommend(single)).toEqual(single[0]);
  });

  test('여러 번 호출해도 항상 목록 내 항목만 반환한다', () => {
    for (let i = 0; i < 20; i++) {
      const result = recommend(foods);
      expect(foods).toContainEqual(result);
    }
  });
});
