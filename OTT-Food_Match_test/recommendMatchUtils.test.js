const { getGenreFromFoodCategory, getCategoriesForSituation } = require('./recommend-match-utils');

describe('getGenreFromFoodCategory', () => {
  test('디저트/카페 → 로맨스', () => {
    expect(getGenreFromFoodCategory('디저트')).toBe('로맨스');
    expect(getGenreFromFoodCategory('카페')).toBe('로맨스');
  });
  test('치킨/패스트푸드/야식 → 액션', () => {
    expect(getGenreFromFoodCategory('치킨')).toBe('액션');
    expect(getGenreFromFoodCategory('패스트푸드')).toBe('액션');
    expect(getGenreFromFoodCategory('야식')).toBe('액션');
  });
  test('중식 → 코미디', () => {
    expect(getGenreFromFoodCategory('중식')).toBe('코미디');
  });
  test('한식/일식/양식/초밥 → 드라마', () => {
    expect(getGenreFromFoodCategory('한식')).toBe('드라마');
    expect(getGenreFromFoodCategory('일식')).toBe('드라마');
    expect(getGenreFromFoodCategory('양식')).toBe('드라마');
    expect(getGenreFromFoodCategory('초밥')).toBe('드라마');
  });
  test('빈 값/매칭 없음 → 전체', () => {
    expect(getGenreFromFoodCategory('')).toBe('전체');
    expect(getGenreFromFoodCategory('기타')).toBe('전체');
    expect(getGenreFromFoodCategory(null)).toBe('전체');
  });
});

describe('getCategoriesForSituation', () => {
  // ── 장르별 분기 (17-21번 라인) ──
  test('액션 → 치킨, 패스트푸드, 중식', () => {
    expect(getCategoriesForSituation('액션', '혼밥')).toEqual(['치킨', '패스트푸드', '중식']);
  });
  test('코미디 → 패스트푸드, 치킨, 중식', () => {
    expect(getCategoriesForSituation('코미디', '혼밥')).toEqual(['패스트푸드', '치킨', '중식']);
  });
  test('드라마 → 한식, 일식, 양식', () => {
    expect(getCategoriesForSituation('드라마', '혼밥')).toEqual(['한식', '일식', '양식']);
  });
  test('로맨스 → 양식, 디저트', () => {
    expect(getCategoriesForSituation('로맨스', '혼밥')).toEqual(['양식', '디저트']);
  });
  test('스릴러 → 치킨, 패스트푸드', () => {
    expect(getCategoriesForSituation('스릴러', '혼밥')).toEqual(['치킨', '패스트푸드']);
  });
  test('애니메이션 → 디저트, 패스트푸드', () => {
    expect(getCategoriesForSituation('애니메이션', '혼밥')).toEqual(['디저트', '패스트푸드']);
  });
  test('전체 장르는 7개 카테고리 전부', () => {
    const result = getCategoriesForSituation('전체', '혼밥');
    expect(result).toEqual(
      expect.arrayContaining(['한식', '중식', '일식', '양식', '패스트푸드', '디저트', '치킨'])
    );
  });

  // ── 식사 상황별 분기 (25-27번 라인) ──
  test('야식 — 치킨/패스트푸드/중식 추가, 중복 제거', () => {
    const r = getCategoriesForSituation('액션', '야식');
    expect(new Set(r).size).toBe(r.length);
    expect(r).toEqual(expect.arrayContaining(['치킨', '패스트푸드', '중식']));
  });
  test('간단한 식사 — 패스트푸드/디저트 추가', () => {
    const r = getCategoriesForSituation('드라마', '간단한 식사');
    expect(r).toEqual(expect.arrayContaining(['한식', '일식', '양식', '패스트푸드', '디저트']));
  });
  test('든든한 식사 — 한식/중식/일식/양식 추가', () => {
    const r = getCategoriesForSituation('스릴러', '든든한 식사');
    expect(r).toEqual(expect.arrayContaining(['치킨', '패스트푸드', '한식', '중식', '일식', '양식']));
  });
  test('디저트 식사상황 — 디저트 추가', () => {
    const r = getCategoriesForSituation('액션', '디저트');
    expect(r).toEqual(expect.arrayContaining(['치킨', '패스트푸드', '중식', '디저트']));
  });
});
