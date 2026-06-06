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


