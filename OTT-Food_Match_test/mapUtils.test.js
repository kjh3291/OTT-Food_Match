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
  test('일식은 돈까스/초밥도 포함', () => {
    expect(matchesCategory('일본식>돈까스', '일식')).toBe(true);
    expect(matchesCategory('일식>초밥', '일식')).toBe(true);
    expect(matchesCategory('한식>국밥', '일식')).toBe(false);
  });
  test('양식은 피자/파스타도 포함', () => {
    expect(matchesCategory('음식점>피자', '양식')).toBe(true);
  });
  test('치킨은 통닭도 포함', () => {
    expect(matchesCategory('치킨,통닭', '치킨')).toBe(true);
  });
  test('알 수 없는 키워드는 모두 통과', () => {
    expect(matchesCategory('아무거나', '전체')).toBe(true);
  });
  test('category_name이 없어도 안전하게 동작', () => {
    expect(matchesCategory(null, '한식')).toBe(false);
  });
});
