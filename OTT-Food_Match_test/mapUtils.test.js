const { getSearchConfig, matchesCategory } = require('./map-utils');

describe('getSearchConfig', () => {
  test('디저트/카페는 CE7 + "카페"로 검색', () => {
    expect(getSearchConfig('디저트')).toEqual({ categoryCode: 'CE7', searchKeyword: '카페' });
    expect(getSearchConfig('카페')).toEqual({ categoryCode: 'CE7', searchKeyword: '카페' });
  });
  test('일반 음식은 FD6 + 원래 키워드', () => {
    expect(getSearchConfig('한식')).toEqual({ categoryCode: 'FD6', searchKeyword: '한식' });
  });
});

describe('matchesCategory', () => {
  // ── 한식 ──
  test('한식 키워드 — cName에 한식 포함 → true', () => {
    expect(matchesCategory('음식점>한식', '한식')).toBe(true);
  });
  test('한식 키워드 — cName에 한식 미포함 → false', () => {
    expect(matchesCategory('음식점>일식', '한식')).toBe(false);
  });

  // ── 중식 ──
  test('중식 키워드 — cName에 중식 포함 → true', () => {
    expect(matchesCategory('음식점>중식', '중식')).toBe(true);
  });
  test('중식 키워드 — cName에 중식 미포함 → false', () => {
    expect(matchesCategory('음식점>한식', '중식')).toBe(false);
  });

  // ── 일식 ──
  test('일식 키워드 — cName에 일식 직접 포함 → true', () => {
    expect(matchesCategory('음식점>일식', '일식')).toBe(true);
  });
  test('일식 키워드 — 돈까스도 포함 → true', () => {
    expect(matchesCategory('일본식>돈까스', '일식')).toBe(true);
  });
  test('일식 키워드 — 초밥도 포함 → true', () => {
    expect(matchesCategory('일식>초밥', '일식')).toBe(true);
  });
  test('일식 키워드 — 미포함 → false', () => {
    expect(matchesCategory('한식>국밥', '일식')).toBe(false);
  });

  // ── 양식 ──
  test('양식 키워드 — cName에 양식 직접 포함 → true', () => {
    expect(matchesCategory('음식점>양식', '양식')).toBe(true);
  });
  test('양식 키워드 — 피자도 포함 → true', () => {
    expect(matchesCategory('음식점>피자', '양식')).toBe(true);
  });
  test('양식 키워드 — 파스타도 포함 → true', () => {
    expect(matchesCategory('음식점>파스타', '양식')).toBe(true);
  });
  test('양식 키워드 — 미포함 → false', () => {
    expect(matchesCategory('음식점>한식', '양식')).toBe(false);
  });

  // ── 치킨 ──
  test('치킨 키워드 — cName에 치킨 직접 포함 → true', () => {
    expect(matchesCategory('음식점>치킨', '치킨')).toBe(true);
  });
  test('치킨 키워드 — 통닭도 포함 → true', () => {
    expect(matchesCategory('치킨,통닭', '치킨')).toBe(true);
  });
  test('치킨 키워드 — 미포함 → false', () => {
    expect(matchesCategory('음식점>한식', '치킨')).toBe(false);
  });

  // ── 패스트푸드 ──
  test('패스트푸드 키워드 — cName에 패스트푸드 직접 포함 → true', () => {
    expect(matchesCategory('음식점>패스트푸드', '패스트푸드')).toBe(true);
  });
  test('패스트푸드 키워드 — 햄버거도 포함 → true', () => {
    expect(matchesCategory('음식점>햄버거', '패스트푸드')).toBe(true);
  });
  test('패스트푸드 키워드 — 미포함 → false', () => {
    expect(matchesCategory('음식점>한식', '패스트푸드')).toBe(false);
  });

  // ── 기타 ──
  test('알 수 없는 키워드는 모두 통과 → true', () => {
    expect(matchesCategory('아무거나', '전체')).toBe(true);
  });
  test('category_name이 null이어도 안전하게 동작', () => {
    expect(matchesCategory(null, '한식')).toBe(false);
  });
});
