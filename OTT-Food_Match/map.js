import { foodCategories } from './food.js';

const mapUrlParams = new URLSearchParams(window.location.search);
const ottKey = mapUrlParams.get("ott") || "netflix";
const selectedMeal = mapUrlParams.get("meal") ? decodeURIComponent(mapUrlParams.get("meal")) : "혼밥";
const selectedFoodCategory = mapUrlParams.get("foodCategory") ? decodeURIComponent(mapUrlParams.get("foodCategory")) : "한식";

function normalizeFoodCategoryForMap(category) {
    const map = {
        "치킨/피자": "치킨",
        "분식(떡볶이 등)": "분식",
        "한식(국밥/찌개)": "한식",
        "양식(파스타 등)": "양식",
    };
    return map[category] || category || "한식";
}

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
let currentCategoryKeyword = "전체";
let currentSelectedPlace = null;

// 1. 초기 실행: 내 위치 가져오기
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

// 2. 지도 이벤트 설정
kakao.maps.event.addListener(map, 'idle', function () {
    if (!isSearchMode) {
        const currentCenter = map.getCenter();
        removeMarkers();
        searchPlacesByCategory(currentCenter);
    }
});

kakao.maps.event.addListener(map, 'click', function () {
    infowindow.close();
});

// 3. 카테고리 버튼 이벤트
const categoryBtns = document.querySelectorAll('.category-btn');
function applyInitialCategoryButton() {
    categoryBtns.forEach((btn) => {
        if (btn.getAttribute('data-keyword') === currentCategoryKeyword) btn.classList.add('active');
        else btn.classList.remove('active');
    });
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

// 4. 주변 검색 (전체 카테고리 지원)
function searchPlacesByCategory(pos) {
    const options = {
        location: pos,
        radius: 1000,
        sort: kakao.maps.services.SortBy.DISTANCE
    };

    if (currentCategoryKeyword === '전체') {
        // '전체'일 때 음식점(FD6) 전체 검색
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

// 5. 직접 검색 및 제어
const keywordInput = document.getElementById('keyword');
const cancelBtn = document.getElementById('cancelBtn');
if (document.getElementById('searchBtn')) document.getElementById('searchBtn').addEventListener('click', searchByManualKeyword);
if (keywordInput) keywordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByManualKeyword(); });

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        infowindow.close();
        keywordInput.value = '';
        isSearchMode = false;
        removeMarkers();
        searchPlacesByCategory(map.getCenter());
    });
}

function searchByManualKeyword() {
    const keyword = keywordInput.value;
    if (!keyword.trim()) return alert('검색어를 입력해주세요!');
    isSearchMode = true;
    ps.keywordSearch(keyword, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            removeMarkers();
            data.forEach(place => displayPlaceMarker(place));
            map.panTo(new kakao.maps.LatLng(data[0].y, data[0].x));
            setTimeout(() => openInfoWindow(data[0], markers[0]), 300);
        } else {
            alert('검색 결과가 없습니다.');
        }
    }, { location: map.getCenter(), sort: kakao.maps.services.SortBy.DISTANCE });
}

function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(place.y, place.x) });
    kakao.maps.event.addListener(marker, 'click', () => openInfoWindow(place, marker));
    markers.push(marker);
}

function removeMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// 정보창: 식당 선택 버튼만 배치
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

// 8. 내 위치 버튼
const myLocationBtn = document.getElementById('myLocationBtn');
if (myLocationBtn) {
    myLocationBtn.addEventListener('click', () => {
        const originalText = myLocationBtn.innerText;
        myLocationBtn.innerText = "찾는 중...";
        navigator.geolocation.getCurrentPosition((pos) => {
            const loc = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            infowindow.close();
            map.panTo(loc);
            updateMyLocation(loc);
            isSearchMode = false;
            keywordInput.value = '';
            removeMarkers();
            searchPlacesByCategory(loc);
            myLocationBtn.innerText = originalText;
        }, () => {
            alert("위치를 가져오지 못했습니다.");
            myLocationBtn.innerText = originalText;
        }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 7000 });
    });
}

function selectCurrentPlaceForMovie() {
    if (!currentSelectedPlace) return alert("선택된 음식점 정보가 없습니다.");
    const url = `recommend.html?mode=mapPick&ott=${encodeURIComponent(ottKey)}&meal=${encodeURIComponent(selectedMeal)}&foodCategory=${encodeURIComponent(currentCategoryKeyword)}&placeName=${encodeURIComponent(currentSelectedPlace.place_name)}&placeCategory=${encodeURIComponent(currentSelectedPlace.category_name || currentCategoryKeyword)}`;
    window.location.href = url;
}
window.selectCurrentPlaceForMovie = selectCurrentPlaceForMovie;