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

describe('sortMovies', () => {
  const movies = [
    { title: '나', popularity: 1, rating: 9, releaseDate: '2020-01-01' },
    { title: '가', popularity: 3, rating: 5, releaseDate: '2024-01-01' },
    { title: '다', popularity: 2, rating: 7, releaseDate: '2022-01-01' },
  ];
  test('인기순 내림차순', () => {
    expect(sortMovies(movies, 'popularity').map(m => m.popularity)).toEqual([3, 2, 1]);
  });
  test('평점순 내림차순', () => {
    expect(sortMovies(movies, 'rating').map(m => m.rating)).toEqual([9, 7, 5]);
  });
  test('최신순', () => {
    expect(sortMovies(movies, 'latest').map(m => m.releaseDate)).toEqual(['2024-01-01', '2022-01-01', '2020-01-01']);
  });
  test('이름순(가나다)', () => {
    expect(sortMovies(movies, 'title').map(m => m.title)).toEqual(['가', '나', '다']);
  });
  test('원본 배열을 변형하지 않는다', () => {
    const copy = [...movies];
    sortMovies(movies, 'rating');
    expect(movies).toEqual(copy);
  });
});

describe('recommendFood', () => {
  test('장르별 추천 음식', () => {
    expect(recommendFood('액션').ko.name).toBe('치킨 + 감자튀김');
    expect(recommendFood('드라마').ko.name).toBe('우동');
  });
  test('없는 장르는 전체 추천으로 폴백', () => {
    expect(recommendFood('없음')).toEqual(recommendFood('전체'));
    expect(recommendFood('없음').ko.name).toBe('치킨 + 콜라');
  });
});
