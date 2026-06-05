import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LIST,
  FOOD_NAME_TO_CATEGORY,
  CATEGORIZED_FOODS,
} from "./food_data.js";
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

   // -------------------------------------------------------------
    // 1. 사용자 신호 → 취향 프로필
    // -------------------------------------------------------------
    const profile = buildUserProfile({
      savedCombos,
      recommendReactions,
      matchHistory,
    });
    const profileText = formatProfileForPrompt(profile);
 
    // 후보 음식을 카테고리별로 묶어 프롬프트에 제공 (food-data.js 그대로 참고)
    const groupedFoodList = FOOD_CATEGORY_LIST.map(
      (cat) => `- ${cat}: ${FOOD_CATEGORIES[cat].join(", ")}`
    ).join("\n");

    const prompt = `
너는 영화와 음식 조합을 추천하는 개인화 AI야.
 
${profileText}
 
[추천 임무]
아래 3가지를 정확히 이 순서/역할로 추천해.
 
1) type="based", badge="취향 기반"
   - 위 취향 프로필을 가장 강하게 반영한 추천.
   - reason에는 반드시 프로필의 "구체적인 신호"를 직접 언급해라.
     (예: "최근 저장하신 액션+치킨 조합", "좋아요 누르신 떡볶이", "자주 고르신 야식 상황")
   - 데이터가 부족하면, 사용을 이어가면 더 정교해진다는 점을 한 문장으로 녹여라.
 
2) type="expand", badge="취향 확장"
   - 사용자의 취향과 인접하지만 살짝 새로운 시도.
   - reason에 "평소와 비슷하면서도 새로운 점"을 설명해라.
 
3) type="discovery", badge="새로운 발견"
   - 취향에서 일부러 벗어난 신선한 조합(편식/필터버블 방지).
   - reason에 "평소와 다른 결을 권하는 이유"를 설명해라.
 
[공통 규칙]
- 실제 영화 제목을 지어내지 말고, 영화는 장르/분위기 중심(movieHint)으로 추천해.
- foodName은 반드시 아래 "음식 후보 목록" 안에 있는 것과 똑같이 써라. 목록에 없는 음식은 만들지 마.
- 싫어요 누른 음식과 "피하는 편" 카테고리는 1번 추천에서 피해라.
- reason은 한국어로 1~2문장, 자연스럽게.
 
[음식 후보 목록]
${groupedFoodList}
 
반드시 아래 JSON 배열 형식만 반환해. JSON 밖에 설명을 쓰지 마.
[
  { "type": "based", "badge": "취향 기반", "title": "...", "movieHint": "...", "genre": "...", "foodName": "...", "foodCategory": "...", "reason": "..." },
  { "type": "expand", "badge": "취향 확장", "title": "...", "movieHint": "...", "genre": "...", "foodName": "...", "foodCategory": "...", "reason": "..." },
  { "type": "discovery", "badge": "새로운 발견", "title": "...", "movieHint": "...", "genre": "...", "foodName": "...", "foodCategory": "...", "reason": "..." }
]
`;

    // -------------------------------------------------------------
    // 3. Gemini 호출 (foodName을 후보 목록 enum으로 강제)
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
            temperature: 0.95,
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  type: { type: "STRING", enum: ["based", "expand", "discovery"] },
                  badge: { type: "STRING" },
                  title: { type: "STRING" },
                  movieHint: { type: "STRING" },
                  genre: { type: "STRING" },
                  foodName: { type: "STRING", enum: ALL_FOOD_NAMES },
                  foodCategory: { type: "STRING", enum: FOOD_CATEGORY_LIST },
                  reason: { type: "STRING" },
                },
                required: ["type", "badge", "title", "movieHint", "genre", "foodName", "reason"],
              },
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
      return res.status(500).json({ message: "Gemini 응답이 비어 있습니다." });
    }
 
    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch (error) {
      return res.status(500).json({
        message: "Gemini 응답 JSON 파싱 실패",
        raw: text,
      });
    }

    // -------------------------------------------------------------
    // 4. 검증 & 보정: 목록 밖 음식은 대체, 카테고리는 우리 데이터 기준으로
    // -------------------------------------------------------------
    const validNameSet = new Set(ALL_FOOD_NAMES);
    const safeRecommendations = (Array.isArray(recommendations) ? recommendations : [])
      .slice(0, 3)
      .map((rec) => {
        let foodName = rec.foodName;
        if (!validNameSet.has(foodName)) {
          foodName = ALL_FOOD_NAMES[Math.floor(Math.random() * ALL_FOOD_NAMES.length)];
        }
        return {
          ...rec,
          foodName,
          foodCategory: FOOD_NAME_TO_CATEGORY[foodName] || "기타",
        };
      });
 
    return res.status(200).json({
      personalized: profile.hasData,
      recommendations: safeRecommendations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "AI 추천 처리 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
}
 