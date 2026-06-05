const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places(map);

// 정보창의 zIndex를 3으로 높여서 내 위치 마커(zIndex: 2)보다 항상 위에 오도록 설정합니다.
const infowindow = new kakao.maps.InfoWindow({ zIndex: 3 });

let markers = [];
let myLocationMarker = null; // 내 위치 표시용 커스텀 오버레이
let isSearchMode = false;

// 1. 초기 실행: 내 위치 가져오기
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        updateMyLocation(locPosition);
        map.setCenter(locPosition);
        searchPlaces(locPosition);
    });
}

// 2. 내 위치 아이콘 표시 함수
function updateMyLocation(locPosition) {
    if (myLocationMarker) myLocationMarker.setMap(null);

    // 원하시는 크기로 조절 가능
    const content = '<div style="width: 10px; height: 10px; background-color: #007bff; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>';

    myLocationMarker = new kakao.maps.CustomOverlay({
        position: locPosition,
        content: content,
        zIndex: 2,     // 내 위치 아이콘의 순서는 2로 유지합니다.
        xAnchor: 0.5,  // 마커 중심을 실제 위치의 정중앙으로 맞춥니다.
        yAnchor: 0.5
    });
    myLocationMarker.setMap(map);
}

// 3. 지도 이벤트 설정
kakao.maps.event.addListener(map, 'idle', function () {
    if (!isSearchMode) {
        const currentCenter = map.getCenter();
        removeMarkers();
        searchPlaces(currentCenter);
    }
});

kakao.maps.event.addListener(map, 'click', function () {
    infowindow.close();
});

// 4. 주변 검색 및 마커 관리
function searchPlaces(pos) {
    ps.categorySearch('FD6', function (data, status) {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }
        }
    }, { location: pos, radius: 1000, sort: kakao.maps.services.SortBy.DISTANCE });
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

// 5. 키워드 검색 로직
const searchBtn = document.getElementById('searchBtn');
const keywordInput = document.getElementById('keyword');
const cancelBtn = document.getElementById('cancelBtn');

if (searchBtn) searchBtn.addEventListener('click', searchByKeyword);
if (keywordInput) keywordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchByKeyword(); });
if (cancelBtn) cancelBtn.addEventListener('click', () => {
    infowindow.close();
    keywordInput.value = '';
    isSearchMode = false;
    searchPlaces(map.getCenter());
});

function searchByKeyword() {
    const keyword = keywordInput.value;
    if (!keyword.trim()) return alert('검색어를 입력해주세요!');

    isSearchMode = true;
    ps.keywordSearch(keyword, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            removeMarkers();
            for (let i = 0; i < data.length; i++) displayPlaceMarker(data[i]);

            map.panTo(new kakao.maps.LatLng(data[0].y, data[0].x));
            setTimeout(() => openInfoWindow(data[0], markers[0]), 300);
        } else {
            alert('검색 결과가 없습니다.');
        }
    }, { category_group_code: 'FD6', location: map.getCenter(), sort: kakao.maps.services.SortBy.DISTANCE });
}

// 6. 정보창 열기
function openInfoWindow(place, marker) {
    const menus = getDynamicMenus(place.category_name);
    let menuHtml = `<strong>추천 메뉴</strong><ul>` + menus.map(m => `<li>${m.name} - ${m.price.toLocaleString()}원</li>`).join('') + `</ul>`;

    infowindow.setContent(`<div style="padding:15px; width:280px;"><h4>${place.place_name}</h4><hr>${menuHtml}</div>`);
    infowindow.open(map, marker);
}

function getDynamicMenus(category) {
    if (category.includes('치킨')) return [{ name: "후라이드", price: 18000 }, { name: "양념", price: 19000 }];
    if (category.includes('중식')) return [{ name: "짜장면", price: 6500 }, { name: "짬뽕", price: 7500 }];
    return [{ name: "대표 메뉴", price: 9000 }];
}

// 7. 내 위치 버튼
const myLocationBtn = document.getElementById('myLocationBtn');
if (myLocationBtn) {
    myLocationBtn.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const loc = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            infowindow.close();
            map.panTo(loc);
            updateMyLocation(loc);
            isSearchMode = false;
            keywordInput.value = '';
            removeMarkers();
            searchPlaces(loc);
        });
    });
}