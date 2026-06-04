const ottProviderMap = {
  netflix: 8,
  disney: 337,
  wavve: 356,
  tving: 97,
};

const genreIdMap = {
  "액션": 28,
  "코미디": 35,
  "드라마": 18,
  "로맨스": 10749,
  "스릴러": 53,
  "애니메이션": 16,
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "GET 요청만 허용됩니다.",
    });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "TMDB_API_KEY가 설정되지 않았습니다.",
    });
  }

  const {
    ott,
    genre = "전체",
    lang = "ko-KR",
    page = "1",
  } = req.query;

  const providerId = ottProviderMap[ott];

  if (!providerId) {
    return res.status(400).json({
      message: "올바른 OTT 값이 아닙니다.",
    });
  }

  const genreId = genreIdMap[genre];

  let tmdbUrl =
    `https://api.themoviedb.org/3/discover/movie` +
    `?api_key=${apiKey}` +
    `&language=${encodeURIComponent(lang)}` +
    `&region=KR` +
    `&watch_region=KR` +
    `&with_watch_providers=${providerId}` +
    `&sort_by=popularity.desc` +
    `&include_adult=false` +
    `&page=${encodeURIComponent(page)}`;

  if (genre !== "전체" && genreId) {
    tmdbUrl += `&with_genres=${genreId}`;
  }

  try {
    const response = await fetch(tmdbUrl);

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        message: "TMDB 영화 목록 요청 실패",
        detail: errorText,
      });
    }

    const data = await response.json();

    const movies = (data.results || []).map((movie) => ({
      id: movie.id,
      title: movie.title || movie.name || "No Title",
      overview: movie.overview || "",
      posterPath: movie.poster_path,
      releaseDate: movie.release_date || "",
      rating: movie.vote_average || 0,
      popularity: movie.popularity || 0,
      genre,
    }));

    return res.status(200).json({
      page: data.page,
      totalPages: data.total_pages,
      movies,
    });
  } catch (error) {
    return res.status(500).json({
      message: "영화 목록 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}