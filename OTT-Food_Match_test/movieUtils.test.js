const { getGenreKey, removeDuplicateMovies, sortMovies, recommendFood } = require('./movie-utils');

describe('getGenreKey', () => {
  test('정상 장르 매핑', () => {
    expect(getGenreKey('액션')).toBe('action');
    expect(getGenreKey('애니메이션')).toBe('animation');
  });
  test('알 수 없는 장르는 all', () => {
    expect(getGenreKey('공포')).toBe('all');
  });
});

describe('removeDuplicateMovies', () => {
  test('id가 같은 영화는 하나만 남긴다', () => {
    const r = removeDuplicateMovies([{ id: 1 }, { id: 1 }, { id: 2 }]);
    expect(r).toHaveLength(2);
  });
  test('빈 배열은 빈 배열', () => {
    expect(removeDuplicateMovies([])).toEqual([]);
  });
});

