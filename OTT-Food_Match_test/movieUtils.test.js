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

