/**
 * test_recommendUtils.js
 * recommend-utils.js 에 대한 Jest Unit Test
 */

const {
  allFoods,
  getCategoriesFromGenre,
  getFoodsByCategories,
  makeRecommendReason,
} = require('../OTT-Food_Match/src/recommend-utils');

// ─────────────────────────────────────────────
// getCategoriesFromGenre
// ─────────────────────────────────────────────
describe('getCategoriesFromGenre', () => {
  test('액션 → 패스트푸드, 식사', () => {
    expect(getCategoriesFromGenre('액션')).toEqual(['패스트푸드', '식사']);
  });

  test('코미디 → 식사', () => {
    expect(getCategoriesFromGenre('코미디')).toEqual(['식사']);
  });

  test('드라마 → 디저트', () => {
    expect(getCategoriesFromGenre('드라마')).toEqual(['디저트']);
  });

  test('로맨스 → 디저트', () => {
    expect(getCategoriesFromGenre('로맨스')).toEqual(['디저트']);
  });

  test('스릴러 → 패스트푸드', () => {
    expect(getCategoriesFromGenre('스릴러')).toEqual(['패스트푸드']);
  });

  test('애니메이션 → 패스트푸드, 디저트', () => {
    expect(getCategoriesFromGenre('애니메이션')).toEqual(['패스트푸드', '디저트']);
  });

  test('알 수 없는 장르 → 전체 카테고리', () => {
    expect(getCategoriesFromGenre('전체')).toEqual(['식사', '패스트푸드', '디저트']);
    expect(getCategoriesFromGenre('')).toEqual(['식사', '패스트푸드', '디저트']);
    expect(getCategoriesFromGenre('공포')).toEqual(['식사', '패스트푸드', '디저트']);
  });
});

// ─────────────────────────────────────────────
// getFoodsByCategories
// ─────────────────────────────────────────────
describe('getFoodsByCategories', () => {
  test('식사 카테고리 음식만 반환한다', () => {
    const result = getFoodsByCategories(['식사']);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(food => expect(food.category).toBe('식사'));
  });

  test('디저트 카테고리 음식만 반환한다', () => {
    const result = getFoodsByCategories(['디저트']);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(food => expect(food.category).toBe('디저트'));
  });

  test('여러 카테고리를 넘기면 해당 카테고리 음식 모두 반환한다', () => {
    const result = getFoodsByCategories(['패스트푸드', '디저트']);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(food =>
      expect(['패스트푸드', '디저트']).toContain(food.category)
    );
  });

  test('존재하지 않는 카테고리면 빈 배열을 반환한다', () => {
    expect(getFoodsByCategories(['없는카테고리'])).toEqual([]);
  });

  test('빈 배열이면 빈 배열을 반환한다', () => {
    expect(getFoodsByCategories([])).toEqual([]);
  });

  test('전체 카테고리 합산은 allFoods 전체와 같다', () => {
    const result = getFoodsByCategories(['식사', '패스트푸드', '디저트']);
    expect(result.length).toBe(allFoods.length);
  });
});

// ─────────────────────────────────────────────
// makeRecommendReason
// ─────────────────────────────────────────────
describe('makeRecommendReason', () => {
  test('액션 장르 추천 사유에 "액션" 키워드가 포함된다', () => {
    const reason = makeRecommendReason('액션', '혼밥', '햄버거');
    expect(reason).toContain('액션');
  });

  test('코미디 장르 추천 사유에 "코미디" 키워드가 포함된다', () => {
    const reason = makeRecommendReason('코미디', '야식', '김치찌개');
    expect(reason).toContain('코미디');
  });

  test('드라마 장르 추천 사유에 "드라마" 키워드가 포함된다', () => {
    const reason = makeRecommendReason('드라마', '간단한 식사', '케이크');
    expect(reason).toContain('드라마');
  });

  test('로맨스 장르 추천 사유에 "로맨스" 키워드가 포함된다', () => {
    const reason = makeRecommendReason('로맨스', '연인과 함께', '마카롱');
    expect(reason).toContain('로맨스');
  });

  test('스릴러 장르 추천 사유에 "스릴러" 키워드가 포함된다', () => {
    const reason = makeRecommendReason('스릴러', '친구와 함께', '피자');
    expect(reason).toContain('스릴러');
  });

  test('애니메이션 장르 추천 사유에 "애니메이션" 키워드가 포함된다', () => {
    const reason = makeRecommendReason('애니메이션', '든든한 식사', '치킨');
    expect(reason).toContain('애니메이션');
  });

  test('알 수 없는 장르는 "전체 장르" 사유가 포함된다', () => {
    const reason = makeRecommendReason('공포', '혼밥', '라면');
    expect(reason).toContain('전체 장르');
  });

  test('음식 이름이 추천 사유에 포함된다', () => {
    const reason = makeRecommendReason('액션', '혼밥', '치킨버거');
    expect(reason).toContain('치킨버거');
  });

  test('식사 상황 "혼밥"이 추천 사유에 반영된다', () => {
    const reason = makeRecommendReason('액션', '혼밥', '라면');
    expect(reason).toContain('혼밥');
  });

  test('식사 상황 "야식"이 추천 사유에 반영된다', () => {
    const reason = makeRecommendReason('코미디', '야식', '떡볶이');
    expect(reason).toContain('야식');
  });

  test('식사 상황 "친구와 함께"가 추천 사유에 반영된다', () => {
    const reason = makeRecommendReason('스릴러', '친구와 함께', '치킨');
    expect(reason).toContain('친구');
  });

  test('식사 상황 "연인과 함께"가 추천 사유에 반영된다', () => {
    const reason = makeRecommendReason('로맨스', '연인과 함께', '마카롱');
    expect(reason).toContain('연인');
  });

  test('식사 상황 "든든한 식사"가 추천 사유에 반영된다', () => {
    const reason = makeRecommendReason('액션', '든든한 식사', '비빔밥');
    expect(reason).toContain('든든한');
  });

  test('빈 문자열이 아닌 결과를 반환한다', () => {
    const reason = makeRecommendReason('전체', '', '김밥');
    expect(reason.length).toBeGreaterThan(0);
  });
});
