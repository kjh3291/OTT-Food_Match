import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LIST,
  FOOD_NAME_TO_CATEGORY,
  CATEGORIZED_FOODS,
} from "./food-data.js";
import { buildUserProfile, formatProfileForPrompt } from "./personalize.js";
 
const ALL_FOOD_NAMES = CATEGORIZED_FOODS.map((f) => f.name);
 
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "POST 요청만 허용됩니다." });
  }
 
  const apiKey = process.env.Gemini_API || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "Gemini_API가 설정되지 않았습니다." });
  }
 
  try {
    const {
      savedCombos = [],
      recommendReactions = [],
      matchHistory = [],
    } = req.body || {};

  try {
    const { savedCombos = [] } = req.body || {};

    const recentCombos = savedCombos.slice(-5).reverse();

    const prompt = `
너는 영화와 음식 조합을 추천하는 AI야.

사용자의 최근 저장 조합:
${recentCombos.length > 0
  ? recentCombos
      .map((combo, index) => {
        return `${index + 1}. 영화: ${combo.movieTitle || "정보 없음"}, 장르: ${combo.genre || "전체"}, 음식: ${combo.foodName || "정보 없음"}, 식사 상황: ${combo.meal || "정보 없음"}`;
      })
      .join("\n")
  : "아직 저장한 조합이 없음"}

요청:
총 3개의 영화+음식 조합을 추천해줘.

조건:
1. 첫 번째 추천은 사용자의 최근 저장 조합을 참고한 취향 기반 추천이어야 해.
2. 두 번째, 세 번째 추천은 랜덤 추천이어야 해.
3. 실제 영화 제목을 지어내지 말고, 영화는 장르/분위기 중심으로 추천해.
4. 음식은 한국 사용자가 이해하기 쉬운 음식명으로 추천해.
5. 반드시 아래 JSON 배열 형식만 반환해. 설명 문장은 JSON 밖에 쓰지 마.

반환 형식:
[
  {
    "type": "based",
    "badge": "취향 기반",
    "title": "최근 저장 조합을 참고했어요",
    "movieHint": "빠른 전개의 액션 영화",
    "genre": "액션",
    "foodName": "치킨버거",
    "reason": "최근 저장한 조합을 참고해 비슷한 분위기로 골라봤어요."
  },
  {
    "type": "random",
    "badge": "랜덤 추천",
    "title": "오늘은 이런 조합 어때요?",
    "movieHint": "가볍게 웃기 좋은 코미디 영화",
    "genre": "코미디",
    "foodName": "떡볶이",
    "reason": "평소와 다른 조합을 시도해볼 수 있도록 골라봤어요."
  },
  {
    "type": "random",
    "badge": "랜덤 추천",
    "title": "오늘은 이런 조합 어때요?",
    "movieHint": "분위기 있게 보기 좋은 로맨스 영화",
    "genre": "로맨스",
    "foodName": "티라미수",
    "reason": "영화 분위기와 음식의 감성이 잘 어울려요."
  }
]
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
            temperature: 0.9,
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

    let recommendations;

    try {
      recommendations = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({
        message: "Gemini 응답 JSON 파싱 실패",
        raw: text,
      });
    }

    return res.status(200).json({
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "AI 추천 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}