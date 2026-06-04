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

     // -------------------------------------------------------------
    // 1. 영화 장르 → 후보 음식 카테고리 → 후보 음식 목록 구성
    //    (food-data.js의 분류 데이터를 그대로 참고)
    // -------------------------------------------------------------
    const genreNames = [selectedGenre, ...(movie.genres || [])];
    const candidateCategories = getCategoriesByGenres(genreNames);
    let candidateFoods = getFoodsByCategories(candidateCategories);
 
    // 혹시라도 후보가 비면 전체 목록으로 안전하게 대체
    if (candidateFoods.length === 0) {
      candidateFoods = [...CATEGORIZED_FOODS];
    }
 
    const candidateNames = candidateFoods.map((f) => f.name);
    const candidateNameSet = new Set(candidateNames);

    // 카테고리별로 묶고, 각 카테고리 안에서 순서를 섞어 프롬프트에 제공
    const groupedListText = candidateCategories
      .map((category) => {
        const names = shuffle(
          candidateFoods
            .filter((f) => f.category === category)
            .map((f) => f.name)
        );
        if (names.length === 0) return null;
        return `- ${category}: ${names.join(", ")}`;
      })
      .filter(Boolean)
      .join("\n");

    const recentSavedCombos = savedCombos.slice(-5).reverse();
    const recentReactions = recommendReactions.slice(-10).reverse();

    const prompt = `
너는 영화와 식사 상황을 고려해서 음식을 추천하는 AI야.
 
[가장 중요한 규칙]
- 추천 음식은 반드시 아래 "후보 음식 목록" 안에 있는 것 중에서 정확히 1개만 고른다.
- 목록에 없는 음식은 절대 만들어내지 않는다.
- foodName은 목록에 적힌 글자와 완전히 똑같이 쓴다.
 
[추천 방법]
- 영화의 장르, 분위기, 줄거리와 식사 상황을 함께 고려한다.
- 사용자의 좋아요/싫어요 기록과 선호 가중치를 참고해서 취향을 반영한다.
- 좋아요가 많았던 음식·카테고리는 더 자주, 싫어요가 있었던 음식은 피한다.
- 매번 같은 음식만 고르지 말고, 같은 조건이어도 자연스럽게 다양하게 추천한다.
- 추천 사유는 한국어로 2~4문장으로 구체적으로 쓴다.

[현재 선택한 영화]
- 제목: ${movie.title}
- 장르: ${movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : selectedGenre}
- 평점: ${movie.rating || "정보 없음"}
- 상영 시간: ${movie.runtime ? movie.runtime + "분" : "정보 없음"}
- 줄거리: ${movie.overview || "정보 없음"}
 
[현재 식사 상황]
${meal || "정보 없음"}
 
[사용자가 선택한 장르 탭]
${selectedGenre || "전체"}
 
[최근 저장한 조합]
${
  recentSavedCombos.length > 0
    ? recentSavedCombos
        .map(
          (combo, index) =>
            `${index + 1}. 영화: ${combo.movieTitle}, 음식: ${combo.foodName}, 장르: ${combo.genre}, 식사 상황: ${combo.meal}`
        )
        .join("\n")
    : "저장한 조합 없음"
}
 
[최근 좋아요/싫어요 기록]
${
  recentReactions.length > 0
    ? recentReactions
        .map(
          (item, index) =>
            `${index + 1}. 음식: ${item.foodName}, 반응: ${item.reaction}, 장르: ${item.genre}, 식사 상황: ${item.meal}`
        )
        .join("\n")
    : "반응 기록 없음"
}
 
[음식 선호 가중치]
${JSON.stringify(preferenceWeights, null, 2)}
 
[후보 음식 목록] (이 안에서만 골라야 함)
${groupedListText}
 
반드시 아래 JSON 형식만 반환해. JSON 밖에 설명을 쓰지 마.
{
  "foodName": "후보 목록 중 하나",
  "foodCategory": "${FOOD_CATEGORY_LIST.join("/")} 중 하나",
  "reason": "왜 이 영화와 식사 상황에 이 음식이 어울리는지 2~4문장",
  "keywords": ["근거 키워드1", "근거 키워드2", "근거 키워드3"]
}
`;

    // -------------------------------------------------------------
    // 3. Gemini 호출
    //    responseSchema의 enum으로 foodName을 후보 목록으로 강제
    // -------------------------------------------------------------
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                foodName: { type: "STRING", enum: candidateNames },
                foodCategory: { type: "STRING", enum: FOOD_CATEGORY_LIST },
                reason: { type: "STRING" },
                keywords: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
              },
              required: ["foodName", "reason"],
            },
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

    // -------------------------------------------------------------
    // 4. 검증 & 보정
    //    - foodName이 후보 목록에 없으면 후보 중 무작위로 대체
    //    - foodCategory는 항상 우리 데이터 기준으로 다시 채움(신뢰성 보장)
    // -------------------------------------------------------------
    let finalName = recommendation.foodName;
 
    if (!candidateNameSet.has(finalName)) {
      finalName = candidateNames[Math.floor(Math.random() * candidateNames.length)];
    }
 
    const finalCategory = FOOD_NAME_TO_CATEGORY[finalName] || "기타";
 
    const result = {
      foodName: finalName,
      foodCategory: finalCategory,
      reason:
        recommendation.reason ||
        `${movie.title}의 분위기와 ${meal || "현재 상황"}을(를) 고려하면 ${finalName}이(가) 잘 어울리는 조합입니다.`,
      keywords: Array.isArray(recommendation.keywords)
        ? recommendation.keywords.slice(0, 3)
        : [],
    };
 
    return res.status(200).json({
      recommendation: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "AI 음식 추천 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
 