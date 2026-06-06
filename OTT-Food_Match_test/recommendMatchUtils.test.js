const { getGenreFromFoodCategory, getCategoriesForSituation } = require('./recommend-match-utils');

describe('getGenreFromFoodCategory', () => {
  test('디저트/카페 → 로맨스', () => {
    expect(getGenreFromFoodCategory('디저트')).toBe('로맨스');
  });
  test('치킨/패스트푸드/야식 → 액션', () => {
    expect(getGenreFromFoodCategory('치킨')).toBe('액션');
  });
  test('중식 → 코미디', () => {
    expect(getGenreFromFoodCategory('중식')).toBe('코미디');
  });
  test('한식/일식/양식/초밥 → 드라마', () => {
    expect(getGenreFromFoodCategory('한식')).toBe('드라마');
  });
  test('빈 값/매칭 없음 → 전체', () => {
    expect(getGenreFromFoodCategory('')).toBe('전체');
    expect(getGenreFromFoodCategory('기타')).toBe('전체');
  });
});

describe('getCategoriesForSituation', () => {
  test('장르 태그 매칭', () => {
    expect(getCategoriesForSituation('액션', '혼밥')).toEqual(['치킨','패스트푸드','중식']);
  });
  test('전체 장르는 7개 카테고리 전부', () => {
    expect(getCategoriesForSituation('전체', '혼밥')).toEqual(
      expect.arrayContaining(['한식','중식','일식','양식','패스트푸드','디저트','치킨'])
    );
  });
  test('식사 상황(야식) 태그가 합쳐지고 중복은 제거된다', () => {
    const r = getCategoriesForSituation('액션', '야식');
    expect(new Set(r).size).toBe(r.length);
    expect(r).toEqual(expect.arrayContaining(['치킨','패스트푸드','중식']));
  });
});
