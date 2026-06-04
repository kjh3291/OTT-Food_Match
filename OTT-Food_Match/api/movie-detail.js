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

  const { movieId, lang = "ko-KR" } = req.query;

  if (!movieId) {
    return res.status(400).json({
      message: "movieId가 없습니다.",
    });
  }

  const tmdbUrl =
    `https://api.themoviedb.org/3/movie/${encodeURIComponent(movieId)}` +
    `?api_key=${apiKey}` +
    `&language=${encodeURIComponent(lang)}`;

  try {
    const response = await fetch(tmdbUrl);

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        message: "TMDB 영화 상세 요청 실패",
        detail: errorText,
      });
    }

    const movie = await response.json();

    return res.status(200).json({
      movie: {
        id: movie.id,
        title: movie.title || "제목 없음",
        overview: movie.overview || "줄거리 정보가 없습니다.",
        posterPath: movie.poster_path,
        releaseDate: movie.release_date || "개봉일 정보 없음",
        rating: movie.vote_average || 0,
        runtime: movie.runtime || 0,
        genres: movie.genres ? movie.genres.map((genre) => genre.name) : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "영화 상세 정보 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}