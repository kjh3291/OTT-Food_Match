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

