// movieUtils.test.js (rev2 — latest/null 및 unknown 정렬 분기 커버)
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
    expect(sortMovies(movies, 'latest').map(m => m.releaseDate))
      .toEqual(['2024-01-01', '2022-01-01', '2020-01-01']);
  });
  test('이름순(가나다)', () => {
    expect(sortMovies(movies, 'title').map(m => m.title)).toEqual(['가', '나', '다']);
  });
  test('두 번째 인자 생략 시 기본값(popularity) 정렬이 적용된다', () => {
    expect(sortMovies(movies).map(m => m.popularity)).toEqual([3, 2, 1]);
  });

  // ── 라인 19: latest 정렬에서 releaseDate가 없는 영화가 섞여 있어도 동작 ──
  //   3개 배열로 비교함수가 여러 번 호출되며 a/b 양쪽 위치에 null이 모두 들어가
  //   (b.releaseDate || "0000-00-00") 와 (a.releaseDate || "0000-00-00") 4개 분기를 전부 커버
  test('releaseDate가 없는 영화가 섞여도 latest 정렬에서 오류 없이 동작한다', () => {
    const arr = [
      { title: 'A', releaseDate: '2024-01-01' },
      { title: 'B', releaseDate: null },
      { title: 'C', releaseDate: '2022-01-01' },
    ];
    const r = sortMovies(arr, 'latest');
    // new Date("0000-00-00")는 Invalid Date(NaN)라 null이 낀 정렬 순서는 보장되지 않음.
    // 여기서는 "오류 없이 동작하고 모든 항목이 유지되는지"만 검증한다.
    expect(r).toHaveLength(3);
    expect(r.map(m => m.title).sort()).toEqual(['A', 'B', 'C']);
  });

  // ── 라인 20: if/else-if 체인의 암묵적 else (아무 정렬 조건에도 해당 안 됨) ──
  test('알 수 없는 정렬 기준이 들어오면 순서를 바꾸지 않고 그대로 반환한다', () => {
    const r = sortMovies(movies, 'unknown');
    expect(r).toHaveLength(movies.length);
    expect(r.map(m => m.title)).toEqual(['나', '가', '다']);
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