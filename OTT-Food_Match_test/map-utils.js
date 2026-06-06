// map-utils.js — map.js의 카카오맵 검색 필터 순수 로직만 복사 (SDK/DOM 제외)
function getSearchConfig(keyword) {
  let categoryCode = 'FD6';
  let searchKeyword = keyword;
  if (keyword.includes('디저트') || keyword.includes('카페')) {
    categoryCode = 'CE7';
    searchKeyword = '카페';
  }
  return { categoryCode, searchKeyword };
}

function matchesCategory(categoryName, keyword) {
  const cName = categoryName || "";
  if (keyword.includes('한식')) return cName.includes('한식');
  if (keyword.includes('중식')) return cName.includes('중식');
  if (keyword.includes('일식')) return cName.includes('일식') || cName.includes('돈까스') || cName.includes('초밥');
  if (keyword.includes('양식')) return cName.includes('양식') || cName.includes('피자') || cName.includes('파스타');
  if (keyword.includes('치킨')) return cName.includes('치킨') || cName.includes('통닭');
  if (keyword.includes('패스트푸드')) return cName.includes('패스트푸드') || cName.includes('햄버거');
  return true; // 그 외 키워드는 모두 통과
}

module.exports = { getSearchConfig, matchesCategory };
