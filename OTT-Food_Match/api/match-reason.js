export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "POST 요청만 허용됩니다.",
    });
  }

  const apiKey = process.env.Gemini_API || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "Gemini_API가 설정되지 않았습니다.",
    });
  }

  const { movie, meal, selectedGenre, foodName, foodCategory } = req.body;

  if (!movie || !foodName) {
    return res.status(400).json({
      message: "movie 또는 foodName 값이 없습니다.",
    });
  }

  const prompt = `
너는 영화와 음식 조합을 추천하는 AI야.

중요:
- 음식은 이미 정해져 있다.
- 절대 다른 음식을 추천하지 마.
- 주어진 음식이 선택한 영화와 식사 상황에 왜 어울리는지만 설명해.
- 한국어로 자연스럽게 작성해.
- 너무 길지 않게 2~3문장으로 작성해.
- 반드시 JSON 형식만 반환해.

입력 정보:
영화 제목: ${movie.title}
영화 장르: ${(movie.genres || []).join(", ") || selectedGenre}
영화 설명: ${movie.overview || "설명 없음"}
식사 상황: ${meal}
고정 음식: ${foodName}
음식 카테고리: ${foodCategory || "기타"}

반환 형식:
{
  "reason": "추천 사유 문장"
}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        message: "Gemini 매칭 사유 요청 실패",
        detail: errorText,
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        message: "Gemini 응답이 비어 있습니다.",
      });
    }

    const parsed = JSON.parse(text);

    return res.status(200).json({
      reason:
        parsed.reason ||
        `${movie.title}의 분위기와 ${meal} 상황을 고려했을 때, ${foodName}은 잘 어울리는 조합입니다.`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "매칭 사유 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}