import {
  FOOD_CATEGORY_LIST,
  FOOD_NAME_TO_CATEGORY,
  getCategoriesByGenres,
  getFoodsByCategories,
  CATEGORIZED_FOODS,
} from "./food-data.js";
 
// 배열을 섞는 헬퍼 (같은 조건에서도 추천이 다양해지도록 후보 순서를 매번 섞음)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "POST 요청만 허용됩니다.",
    });
  }

  const apiKey = process.env.Gemini_API;

  if (!apiKey) {
    return res.status(500).json({
      message: "Gemini_API가 설정되지 않았습니다.",
    });
  }

  try {
    const {
      movie,
      meal,
      selectedGenre,
      savedCombos = [],
      recommendReactions = [],
      preferenceWeights = {},
    } = req.body || {};

    if (!movie) {
      return res.status(400).json({
        message: "영화 정보가 없습니다.",
      });
    }

    const recentSavedCombos = savedCombos.slice(-5).reverse();
    const recentReactions = recommendReactions.slice(-10).reverse();

    const prompt = `
너는 영화와 식사 상황을 고려해서 음식을 추천하는 AI야.

목표:
- 사용자가 선택한 영화와 식사 상황에 어울리는 음식 1개를 추천한다.
- 추천 사유는 영화의 분위기, 장르, 줄거리, 식사 상황을 함께 고려해서 작성한다.
- 사용자의 좋아요/싫어요 기록과 가중치를 참고해서 추천을 고도화한다.
- 매번 같은 음식만 추천하지 말고, 같은 조건이어도 자연스럽게 다양한 음식을 추천한다.
- 한국 사용자가 이해하기 쉬운 음식명으로 추천한다.

현재 선택한 영화:
- 제목: ${movie.title}
- 장르: ${movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : selectedGenre}
- 평점: ${movie.rating || "정보 없음"}
- 상영 시간: ${movie.runtime || "정보 없음"}분
- 줄거리: ${movie.overview || "정보 없음"}

현재 식사 상황:
${meal || "정보 없음"}

사용자가 선택한 장르 탭:
${selectedGenre || "전체"}

최근 저장한 조합:
${
  recentSavedCombos.length > 0
    ? recentSavedCombos
        .map((combo, index) => {
          return `${index + 1}. 영화: ${combo.movieTitle}, 음식: ${combo.foodName}, 장르: ${combo.genre}, 식사 상황: ${combo.meal}`;
        })
        .join("\n")
    : "저장한 조합 없음"
}

최근 좋아요/싫어요 기록:
${
  recentReactions.length > 0
    ? recentReactions
        .map((item, index) => {
          return `${index + 1}. 영화: ${item.movieTitle}, 음식: ${item.foodName}, 반응: ${item.reaction}, 장르: ${item.genre}, 식사 상황: ${item.meal}`;
        })
        .join("\n")
    : "반응 기록 없음"
}

음식 선호 가중치:
${JSON.stringify(preferenceWeights, null, 2)}

반드시 아래 JSON 형식만 반환해. JSON 밖에 설명을 쓰지 마.

{
  "foodName": "추천 음식명",
  "foodCategory": "식사/디저트/패스트푸드/간식/기타 중 하나",
  "reason": "왜 이 영화와 식사 상황에 이 음식이 어울리는지 2~4문장으로 설명",
  "keywords": ["추천 근거 키워드1", "추천 근거 키워드2", "추천 근거 키워드3"]
}
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 1.0,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      return res.status(geminiResponse.status).json({
        message: "Gemini API 요청 실패",
        detail: errorText,
      });
    }

    const data = await geminiResponse.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        message: "Gemini 응답이 비어 있습니다.",
      });
    }

    let recommendation;

    try {
      recommendation = JSON.parse(text);
    } catch (error) {
      return res.status(500).json({
        message: "Gemini 응답 JSON 파싱 실패",
        raw: text,
      });
    }

    return res.status(200).json({
      recommendation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "AI 음식 추천 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}