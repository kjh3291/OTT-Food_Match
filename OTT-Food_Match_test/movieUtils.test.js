const {
  getGenreKey,
  removeDuplicateMovies,
  sortMovies,
  recommendFood,
} = require("../movie-utils");

describe("movie-utils", () => {
  describe("getGenreKey", () => {
    test("장르명을 내부 key로 변환한다", () => {
      expect(getGenreKey("전체")).toBe("all");
      expect(getGenreKey("액션")).toBe("action");
      expect(getGenreKey("코미디")).toBe("comedy");
      expect(getGenreKey("드라마")).toBe("drama");
      expect(getGenreKey("로맨스")).toBe("romance");
      expect(getGenreKey("스릴러")).toBe("thriller");
      expect(getGenreKey("애니메이션")).toBe("animation");
    });

    test("알 수 없는 장르는 all로 변환한다", () => {
      expect(getGenreKey("공포")).toBe("all");
      expect(getGenreKey("")).toBe("all");
      expect(getGenreKey(null)).toBe("all");
      expect(getGenreKey(undefined)).toBe("all");
    });
  });

  describe("removeDuplicateMovies", () => {
    test("중복된 영화 id를 제거한다", () => {
      const movies = [
        { id: 1, title: "영화 A" },
        { id: 2, title: "영화 B" },
        { id: 1, title: "영화 A 중복" },
      ];

      const result = removeDuplicateMovies(movies);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, title: "영화 A" });
      expect(result[1]).toEqual({ id: 2, title: "영화 B" });
    });

    test("중복이 없으면 원래 개수를 유지한다", () => {
      const movies = [
        { id: 1, title: "영화 A" },
        { id: 2, title: "영화 B" },
        { id: 3, title: "영화 C" },
      ];

      const result = removeDuplicateMovies(movies);

      expect(result).toHaveLength(3);
      expect(result).toEqual(movies);
    });

    test("빈 배열이 들어오면 빈 배열을 반환한다", () => {
      expect(removeDuplicateMovies([])).toEqual([]);
    });
  });

  describe("sortMovies", () => {
    test("인기순으로 영화를 정렬한다", () => {
      const movies = [
        { title: "A", popularity: 10 },
        { title: "B", popularity: 30 },
        { title: "C", popularity: 20 },
      ];

      const result = sortMovies(movies, "popularity");

      expect(result.map((movie) => movie.title)).toEqual(["B", "C", "A"]);
    });

    test("정렬 기준이 없으면 기본값으로 인기순 정렬한다", () => {
      const movies = [
        { title: "A", popularity: 10 },
        { title: "B", popularity: 30 },
        { title: "C", popularity: 20 },
      ];

      const result = sortMovies(movies);

      expect(result.map((movie) => movie.title)).toEqual(["B", "C", "A"]);
    });

    test("평점순으로 영화를 정렬한다", () => {
      const movies = [
        { title: "A", rating: 7.1 },
        { title: "B", rating: 9.2 },
        { title: "C", rating: 8.4 },
      ];

      const result = sortMovies(movies, "rating");

      expect(result.map((movie) => movie.title)).toEqual(["B", "C", "A"]);
    });

    test("최신순으로 영화를 정렬한다", () => {
      const movies = [
        { title: "A", releaseDate: "2020-01-01" },
        { title: "B", releaseDate: "2024-01-01" },
        { title: "C", releaseDate: "2022-01-01" },
      ];

      const result = sortMovies(movies, "latest");

      expect(result.map((movie) => movie.title)).toEqual(["B", "C", "A"]);
    });

    test("최신순 정렬에서 a.releaseDate가 없으면 기본 날짜로 처리한다", () => {
      const movies = [
        { title: "날짜 없음", releaseDate: "" },
        { title: "최신 영화", releaseDate: "2024-01-01" },
        { title: "옛날 영화", releaseDate: "2020-01-01" },
      ];

      const result = sortMovies(movies, "latest");

      expect(result.map((movie) => movie.title)).toEqual([
        "최신 영화",
        "옛날 영화",
        "날짜 없음",
      ]);
    });

    test("최신순 정렬에서 b.releaseDate가 없으면 기본 날짜로 처리한다", () => {
      const movies = [
        { title: "최신 영화", releaseDate: "2024-01-01" },
        { title: "날짜 없음", releaseDate: "" },
        { title: "옛날 영화", releaseDate: "2020-01-01" },
      ];

      const result = sortMovies(movies, "latest");

      expect(result.map((movie) => movie.title)).toEqual([
        "최신 영화",
        "옛날 영화",
        "날짜 없음",
      ]);
    });

    test("최신순 정렬에서 releaseDate가 undefined여도 기본 날짜로 처리한다", () => {
      const movies = [
        { title: "날짜 undefined" },
        { title: "날짜 있음", releaseDate: "2023-05-01" },
      ];

      const result = sortMovies(movies, "latest");

      expect(result.map((movie) => movie.title)).toEqual([
        "날짜 있음",
        "날짜 undefined",
      ]);
    });

    test("제목순으로 영화를 정렬한다", () => {
      const movies = [
        { title: "하하" },
        { title: "가가" },
        { title: "다다" },
      ];

      const result = sortMovies(movies, "title");

      expect(result.map((movie) => movie.title)).toEqual([
        "가가",
        "다다",
        "하하",
      ]);
    });

    test("알 수 없는 정렬 기준이면 원래 순서를 유지한다", () => {
      const movies = [
        { title: "A", popularity: 10 },
        { title: "B", popularity: 30 },
        { title: "C", popularity: 20 },
      ];

      const result = sortMovies(movies, "unknown");

      expect(result.map((movie) => movie.title)).toEqual(["A", "B", "C"]);
    });

    test("정렬 후에도 원본 배열은 변경되지 않는다", () => {
      const movies = [
        { title: "A", popularity: 10 },
        { title: "B", popularity: 30 },
      ];

      const original = [...movies];

      sortMovies(movies, "popularity");

      expect(movies).toEqual(original);
    });
  });

  describe("recommendFood", () => {
    test("장르별 추천 음식을 반환한다", () => {
      expect(recommendFood("전체").ko.name).toBe("치킨 + 콜라");
      expect(recommendFood("스릴러").ko.name).toBe("피자 + 콜라");
      expect(recommendFood("코미디").ko.name).toBe("떡볶이 + 튀김");
      expect(recommendFood("드라마").ko.name).toBe("우동");
      expect(recommendFood("로맨스").ko.name).toBe("파스타 + 샐러드");
      expect(recommendFood("액션").ko.name).toBe("치킨 + 감자튀김");
      expect(recommendFood("애니메이션").ko.name).toBe("햄버거 세트");
    });

    test("알 수 없는 장르는 전체 추천 음식으로 처리한다", () => {
      expect(recommendFood("공포").ko.name).toBe("치킨 + 콜라");
      expect(recommendFood("").ko.name).toBe("치킨 + 콜라");
      expect(recommendFood(null).ko.name).toBe("치킨 + 콜라");
      expect(recommendFood(undefined).ko.name).toBe("치킨 + 콜라");
    });
  });
});