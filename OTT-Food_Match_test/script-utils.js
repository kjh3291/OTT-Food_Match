// script-utils.js — script.js의 DOMContentLoaded 내부 순수 로직만 복사
function getGenreKey(genre) {
  const map = { "전체":"all","액션":"action","코미디":"comedy","드라마":"drama","로맨스":"romance","스릴러":"thriller","애니메이션":"animation" };
  return map[genre] || "all";
}

function mapOttNameToParam(ottName) {
  const ottUrlMap = {
    "넷플릭스":"netflix","Netflix":"netflix","netflix":"netflix",
    "디즈니+":"disney","Disney+":"disney","disney":"disney",
    "티빙":"tving","TVING":"tving","tving":"tving",
    "웨이브":"wavve","wavve":"wavve","Wavve":"wavve"
  };
  return ottUrlMap[ottName] || null;
}

function getSimilarGenres(genre) {
  const map = {
    "액션":["액션","스릴러"], "스릴러":["스릴러","액션"],
    "코미디":["코미디","애니메이션"], "애니메이션":["애니메이션","코미디"],
    "드라마":["드라마","로맨스"], "로맨스":["로맨스","드라마"],
    "전체":["액션","코미디","드라마","로맨스","스릴러","애니메이션"]
  };
  return map[genre] || map["전체"];
}

module.exports = { getGenreKey, mapOttNameToParam, getSimilarGenres };
