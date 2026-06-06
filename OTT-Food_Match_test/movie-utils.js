// movie-utils.js — movie.js에서 DOM/fetch/localStorage를 제외한 순수 함수만 복사
function getGenreKey(genre) {
  const map = { "전체": "all", "액션": "action", "코미디": "comedy", "드라마": "drama", "로맨스": "romance", "스릴러": "thriller", "애니메이션": "animation" };
  return map[genre] || "all";
}

function removeDuplicateMovies(movies) {
  const movieMap = new Map();
  movies.forEach((movie) => { if (!movieMap.has(movie.id)) movieMap.set(movie.id, movie); });
  return Array.from(movieMap.values());
}

// 원본은 전역 currentSort에 의존하므로, 테스트 가능하도록 정렬 기준을 인자로 받게 변경
function sortMovies(movies, currentSort = "popularity") {
  const sorted = [...movies];
  if (currentSort === "popularity") sorted.sort((a, b) => b.popularity - a.popularity);
  else if (currentSort === "rating") sorted.sort((a, b) => b.rating - a.rating);
  else if (currentSort === "latest") sorted.sort((a, b) =>
    new Date(b.releaseDate || "0000-00-00") - new Date(a.releaseDate || "0000-00-00"));
  else if (currentSort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
  return sorted;
}

