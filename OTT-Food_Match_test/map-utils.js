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


