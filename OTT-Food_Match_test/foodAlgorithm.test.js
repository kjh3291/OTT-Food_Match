/**
 * foodAlgorithm.test.js
 * food-algorithm.js 에 대한 Jest Unit Test
 */

const { convertFoods, recommend } = require('./food-algorithm');

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

