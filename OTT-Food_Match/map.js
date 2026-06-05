import { foodCategories } from './food.js';

// ===============================
// 1. URL 파라미터 가져오기
// ===============================
const mapUrlParams = new URLSearchParams(window.location.search);
const ottKey = mapUrlParams.get("ott") || "netflix";
const selectedMeal = mapUrlParams.get("meal") ? decodeURIComponent(mapUrlParams.get("meal")) : "혼밥";
const passedMovieId = mapUrlParams.get("movieId");

// ===============================
// 2. 지도 초기화 및 기본 변수 설정
// ===============================
const mapContainer = document.getElementById('map');
const mapOption = { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 3 };
const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places(map);
const infowindow = new kakao.maps.InfoWindow({ zIndex: 3 });

let markers = [];
let myLocationMarker = null;
let isSearchMode = false;
let currentSelectedPlace = null;

// 💡 3. 초기 카테고리 설정 (가장 중요)
let currentCategoryKeyword = "전체";
const passedCategory = mapUrlParams.get("foodCategory");
if (passedCategory) {
    // 추천 페이지에서 넘어온 카테고리명(예: '한식', '치킨')을 그대로 유지!
    currentCategoryKeyword = decodeURIComponent(passedCategory);
}

// ===============================
// 4. 내 위치 가져오기 및 초기 검색
// ===============================
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        updateMyLocation(locPosition);
        map.setCenter(locPosition);
        searchPlacesByCategory(locPosition);
    });
}

function updateMyLocation(locPosition) {
    if (myLocationMarker) myLocationMarker.setMap(null);
    const content = '<div style="width:10px;height:10px;background-color:#6c5ce7;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(108,92,231,0.8);"></div>';
    myLocationMarker = new kakao.maps.CustomOverlay({ position: locPosition, content: content, zIndex: 2, xAnchor: 0.5, yAnchor: 0.5 });
    myLocationMarker.setMap(map);
}

// 지도 드래그/확대 후 멈출 때 자동 재검색
kakao.maps.event.addListener(map, 'idle', function () {
    if (!isSearchMode) {
        removeMarkers();
        searchPlacesByCategory(map.getCenter());
    }
});
kakao.maps.event.addListener(map, 'click', () => infowindow.close());

// ===============================
// 5. 사이드바 버튼 연동 로직
// ===============================
const categoryBtns = document.querySelectorAll('.category-btn');

function applyInitialCategoryButton() {
    let matched = false;
    categoryBtns.forEach((btn) => {
        const btnKeyword = btn.getAttribute('data-keyword');
        if (btnKeyword === currentCategoryKeyword) {
            btn.classList.add('active');
            matched = true;
        } else {
            btn.classList.remove('active');
        }
    });

    // 💡 치명적 버그 해결: 일치하는 버튼이 없더라도 currentCategoryKeyword를 '전체'로 덮어쓰지 않습니다!
    if (!matched) {
        const defaultBtn = document.querySelector('.category-btn[data-keyword="전체"]');
        if (defaultBtn) defaultBtn.classList.add('active');
    }
}
applyInitialCategoryButton();

categoryBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategoryKeyword = this.getAttribute('data-keyword');
        isSearchMode = false;
        removeMarkers();
        infowindow.close();
        searchPlacesByCategory(map.getCenter());
    });
});

// ===============================
// 6. 식당 검색 (카카오맵 API 정밀 필터링 적용)
// ===============================
function searchPlacesByCategory(pos) {
    const options = { location: pos, radius: 1000, sort: kakao.maps.services.SortBy.DISTANCE };

    if (currentCategoryKeyword === '전체') {
        ps.categorySearch('FD6', (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                data.forEach(place => displayPlaceMarker(place));
            }
        }, options);
    } else {
        let categoryCode = 'FD6';
        let searchKeyword = currentCategoryKeyword;

        // 디저트는 카페(CE7) 코드로 검색해야 잘 나옵니다.
        if (currentCategoryKeyword.includes('디저트') || currentCategoryKeyword.includes('카페')) {
            categoryCode = 'CE7';
            searchKeyword = '카페';
        }

        ps.keywordSearch(searchKeyword, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {

                // 💡 핵심 개선: 카카오맵의 넓은 검색 결과를 '현재 카테고리'에 맞게 한 번 더 정밀하게 걸러냅니다!
                const filteredData = data.filter(place => {
                    const cName = place.category_name || "";
                    if (currentCategoryKeyword.includes('한식')) return cName.includes('한식');
                    if (currentCategoryKeyword.includes('중식')) return cName.includes('중식');
                    if (currentCategoryKeyword.includes('일식')) return cName.includes('일식') || cName.includes('돈까스') || cName.includes('초밥');
                    if (currentCategoryKeyword.includes('양식')) return cName.includes('양식') || cName.includes('피자') || cName.includes('파스타');
                    if (currentCategoryKeyword.includes('치킨')) return cName.includes('치킨') || cName.includes('통닭');
                    if (currentCategoryKeyword.includes('패스트푸드')) return cName.includes('패스트푸드') || cName.includes('햄버거');
                    return true;
                });

                // 필터링 후 남은 결과가 없으면 어쩔 수 없이 원본 데이터를 보여줍니다.
                const finalData = filteredData.length > 0 ? filteredData : data;

                finalData.forEach(place => displayPlaceMarker(place));
            }
        }, { ...options, category_group_code: categoryCode });
    }
}

// 수동 텍스트 검색
function searchByManualKeyword() {
    const keyword = document.getElementById('keyword').value;
    if (!keyword.trim()) return alert('검색어를 입력해주세요!');
    isSearchMode = true;
    ps.keywordSearch(keyword, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            removeMarkers();
            data.forEach(place => displayPlaceMarker(place));
            map.panTo(new kakao.maps.LatLng(data[0].y, data[0].x));
            setTimeout(() => openInfoWindow(data[0], markers[0]), 300);
        } else alert('결과가 없습니다.');
    }, { location: map.getCenter(), sort: kakao.maps.services.SortBy.DISTANCE });
}

// ===============================
// 7. 마커 및 창 표시
// ===============================
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(place.y, place.x) });
    kakao.maps.event.addListener(marker, 'click', () => {
        map.panTo(marker.getPosition());
        openInfoWindow(place, marker);
    });
    markers.push(marker);
}

function removeMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

function openInfoWindow(place, marker) {
    currentSelectedPlace = place;
    const content = `
        <div style="padding:15px; background:rgba(20,20,30,0.95); color:#fff; font-size:14px; width:230px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <strong style="font-size:16px; color:#a29bfe;">${place.place_name}</strong><br>
            <span style="color:#aaa; font-size:12px;">${place.category_name || currentCategoryKeyword}</span>
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;">
            <button onclick="selectCurrentPlaceForMovie()" style="width:100%; padding:12px; border:none; border-radius:8px; background:#ff715b; color:white; font-weight:bold; cursor:pointer; font-size: 15px;">이 식당 선택하기</button>
        </div>
    `;
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// ===============================
// 8. 영화 선택으로 돌아가기
// ===============================
window.selectCurrentPlaceForMovie = function () {
    if (!currentSelectedPlace) return alert("식당 정보가 없습니다.");

    // 이전에 선택했던 영화 ID를 그대로 살려서 파라미터로 붙입니다.
    const movieIdParam = passedMovieId ? `&movieId=${encodeURIComponent(passedMovieId)}` : "";

    const url = `recommend.html?mode=mapPick&ott=${encodeURIComponent(ottKey)}&meal=${encodeURIComponent(selectedMeal)}${movieIdParam}&foodCategory=${encodeURIComponent(currentCategoryKeyword)}&placeName=${encodeURIComponent(currentSelectedPlace.place_name)}&placeCategory=${encodeURIComponent(currentSelectedPlace.category_name || currentCategoryKeyword)}`;
    window.location.href = url;
};

// ===============================
// 9. 화면 내 기타 UI 버튼 이벤트
// ===============================
document.getElementById('myLocationBtn')?.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((pos) => {
        const loc = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        infowindow.close();
        map.panTo(loc);
        updateMyLocation(loc);
        isSearchMode = false;
        const keywordInput = document.getElementById('keyword');
        if (keywordInput) keywordInput.value = '';
        removeMarkers();
        searchPlacesByCategory(loc);
    });
});
document.getElementById('searchBtn')?.addEventListener('click', searchByManualKeyword);
document.getElementById('keyword')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByManualKeyword(); });
document.getElementById('cancelBtn')?.addEventListener('click', () => {
    infowindow.close();
    isSearchMode = false;
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) keywordInput.value = '';
    removeMarkers();
    searchPlacesByCategory(map.getCenter());
});