const { getGenreKey, mapOttNameToParam, getSimilarGenres } = require('./script-utils');

describe('mapOttNameToParam', () => {
  test('한글/영문/소문자 OTT명을 파라미터로 변환', () => {
    expect(mapOttNameToParam('넷플릭스')).toBe('netflix');
    expect(mapOttNameToParam('Disney+')).toBe('disney');
    expect(mapOttNameToParam('tving')).toBe('tving');
  });
  test('알 수 없는 OTT명은 null', () => {
    expect(mapOttNameToParam('왓챠')).toBeNull();
  });
});

describe('getSimilarGenres', () => {
  test('장르별 유사 장르 목록', () => {
    expect(getSimilarGenres('액션')).toEqual(['액션','스릴러']);
  });
  test('알 수 없는 장르는 전체 후보', () => {
    expect(getSimilarGenres('공포')).toHaveLength(6);
  });
});

describe('getGenreKey', () => {
  test('정상/폴백 매핑', () => {
    expect(getGenreKey('로맨스')).toBe('romance');
    expect(getGenreKey('xxx')).toBe('all');
  });
});
