import { buildUserProfile, formatProfileForPrompt } from "./personalize.js";
 
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "POST 요청만 허용됩니다." });
  }
 
  const apiKey = process.env.Gemini_API || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: "Gemini_API가 설정되지 않았습니다." });
  }
 
  const {
    movie,
    meal,
    selectedGenre,
    foodName,
    foodCategory,
    savedCombos = [],
    recommendReactions = [],
    matchHistory = [],
  } = req.body || {};
 
  if (!movie || !foodName) {
    return res.status(400).json({ message: "movie 또는 foodName 값이 없습니다." });
  }
 
  // 사용자 신호 → 취향 프로필
  const profile = buildUserProfile({ savedCombos, recommendReactions, matchHistory });
  const profileText = formatProfileForPrompt(profile);

  const prompt = `
너는 영화와 음식 조합을 설명하는 AI야.
 
[가장 중요한 규칙]
- 음식은 이미 "${foodName}"으로 정해져 있다. 절대 다른 음식을 추천하거나 바꾸지 마.
- 주어진 음식이 이 영화/식사 상황/사용자 취향에 왜 어울리는지만 설명해.
 
${profileText}
 
[작성 방법]
- 전체 2~3문장, 한국어로 자연스럽게.
- 취향 프로필에 의미 있는 신호가 있으면, 그중 하나를 골라 사유에 자연스럽게 언급해서
  "이 사용자에게 맞춘 추천"이라는 느낌이 드러나게 해라.
  (예: "평소 ${"{좋아하시던 음식/장르}"}를 즐기시는 편이라 이번 조합도 잘 맞아요")
- 단, 억지로 끼워 넣지 말고 자연스러울 때만 언급해라.
- 데이터가 부족하면 일반적인 근거로 설명하되 어색하지 않게 써라.
 
[입력 정보]
- 영화 제목: ${movie.title}
- 영화 장르: ${(movie.genres || []).join(", ") || selectedGenre || "정보 없음"}
- 영화 설명: ${movie.overview || "설명 없음"}
- 식사 상황: ${meal || "정보 없음"}
- 고정 음식: ${foodName}
- 음식 카테고리: ${foodCategory || "기타"}
 
반드시 아래 JSON 형식만 반환해.
{
  "reason": "추천 사유 문장",
  "personalTouch": "사유에서 사용자 취향을 언급했다면 그 핵심 신호 한 단어/구, 없으면 빈 문자열"
}
`;

  try {
    const response = await fetch(
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
            temperature: 0.85,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                reason: { type: "STRING" },
                personalTouch: { type: "STRING" },
              },
              required: ["reason"],
            },
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