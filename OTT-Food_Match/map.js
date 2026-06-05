import { foodCategories } from './food.js';

// ===============================
// 1. URL 파라미터 가져오기
// ===============================
const mapUrlParams = new URLSearchParams(window.location.search);
const ottKey = mapUrlParams.get("ott") || "netflix";
const selectedMeal = mapUrlParams.get("meal") ? decodeURIComponent(mapUrlParams.get("meal")) : "혼밥";

// 💡 추천받은 음식 카테고리를 지도 사이드바 버튼 키워드에 맞게 변환
function normalizeFoodCategoryForMap(category) {
    if (!category) return "전체";
    if (category.includes("마라")) return "마라탕";
    if (category.includes("한식")) return "한식";
    if (category.includes("일식")) return "일식";
    if (category.includes("양식")) return "양식";
    if (category.includes("중식")) return "중식";
    if (category.includes("치킨") || category.includes("야식")) return "치킨";
    if (category.includes("분식")) return "분식";
    if (category.includes("패스트푸드")) return "패스트푸드";
    if (category.includes("디저트") || category.includes("카페")) return "카페";

    return "전체"; // 기본값
}

// ===============================
// 2. 지도 초기화 및 기본 변수 설정
// ===============================
const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places(map);
const infowindow = new kakao.maps.InfoWindow({ zIndex: 3 });

let markers = [];
let myLocationMarker = null;
let isSearchMode = false;
let currentSelectedPlace = null;

// 💡 핵심: 기본값은 '전체', 하지만 주소창으로 넘어온 카테고리가 있으면 그걸로 덮어씁니다!
let currentCategoryKeyword = "전체";
const passedCategory = mapUrlParams.get("foodCategory");
if (passedCategory) {
    currentCategoryKeyword = normalizeFoodCategoryForMap(decodeURIComponent(passedCategory));
}


// ===============================
// 3. 내 위치 가져오기 및 마커 표시
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
    myLocationMarker = new kakao.maps.CustomOverlay({
        position: locPosition,
        content: content,
        zIndex: 2,
        xAnchor: 0.5,
        yAnchor: 0.5
    });
    myLocationMarker.setMap(map);
}

// ===============================
// 4. 지도 이벤트 (드래그, 클릭)
// ===============================
kakao.maps.event.addListener(map, 'idle', function () {
    if (!isSearchMode) {
        removeMarkers();
        searchPlacesByCategory(map.getCenter());
    }
});

kakao.maps.event.addListener(map, 'click', () => infowindow.close());


// ===============================
// 5. 사이드바 카테고리 버튼 처리
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

    // 매칭되는 버튼이 없으면 무조건 '전체' 버튼 활성화
    if (!matched) {
        const defaultBtn = document.querySelector('.category-btn[data-keyword="전체"]');
        if (defaultBtn) defaultBtn.classList.add('active');
        currentCategoryKeyword = "전체";
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
// 6. 식당 검색 핵심 로직 (자동 & 수동)
// ===============================
function searchPlacesByCategory(pos) {
    const options = { location: pos, radius: 1000, sort: kakao.maps.services.SortBy.DISTANCE };

    if (currentCategoryKeyword === '전체') {
        // 전체 카테고리일 때 음식점(FD6) 전체 검색
        ps.categorySearch('FD6', (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                data.forEach(place => displayPlaceMarker(place));
            }
        }, options);
    } else {
        const categoryCode = currentCategoryKeyword === '카페' ? 'CE7' : 'FD6';
        ps.keywordSearch(currentCategoryKeyword, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                data.forEach(place => displayPlaceMarker(place));
            }
        }, { ...options, category_group_code: categoryCode });
    }
}

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
// 7. 마커 및 식당 정보창 표시
// ===============================
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(place.y, place.x) });

    kakao.maps.event.addListener(marker, 'click', () => {
        // 💡 마커 클릭 시 해당 식당을 지도 중앙으로 부드럽게 이동
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
// 8. 식당 선택 후 돌아가기 (데이터 보존 로직)
// ===============================
window.selectCurrentPlaceForMovie = function () {
    if (!currentSelectedPlace) return alert("식당 정보가 없습니다.");

    // 💡 핵심: 기존 URL에 있던 movieId(선택했던 영화)가 사라지지 않도록 그대로 가져가서 조립합니다.
    const movieIdParam = mapUrlParams.get("movieId") ? `&movieId=${mapUrlParams.get("movieId")}` : "";

    const url = `recommend.html?mode=mapPick&ott=${encodeURIComponent(ottKey)}&meal=${encodeURIComponent(selectedMeal)}${movieIdParam}&foodCategory=${encodeURIComponent(currentCategoryKeyword)}&placeName=${encodeURIComponent(currentSelectedPlace.place_name)}&placeCategory=${encodeURIComponent(currentSelectedPlace.category_name || currentCategoryKeyword)}`;

    window.location.href = url;
};


// ===============================
// 9. 화면 내 검색 / 위치 버튼 이벤트 연동
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