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

    const content = '<div style="width: 10px; height: 10px; background-color: #007bff; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>';

    myLocationMarker = new kakao.maps.CustomOverlay({
        position: locPosition,
        content: content,
        zIndex: 2,
        xAnchor: 0.5,
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
    const options = { location: pos, radius: 1000, sort: kakao.maps.services.SortBy.DISTANCE };

    // 음식점(FD6) 검색
    ps.categorySearch('FD6', function (data, status) {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }
        }
    }, options);

    // 카페(CE7) 검색
    ps.categorySearch('CE7', function (data, status) {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }
        }
    }, options);
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

    // 카테고리 제한 없이 모두 검색
    ps.keywordSearch(keyword, (data, status) => {
        if (status === kakao.maps.services.Status.OK) {

            // 검색한 데이터 중 음식점 및 카페만 필터링
            const filteredData = data.filter(place => place.category_group_code === 'FD6' || place.category_group_code === 'CE7');

            if (filteredData.length === 0) {
                alert('검색된 결과 중 음식점이나 카페가 없습니다.');
                return;
            }

            removeMarkers();

            // 필터링된 결과만 마커로 찍습니다.
            for (let i = 0; i < filteredData.length; i++) {
                displayPlaceMarker(filteredData[i]);
            }

            // 필터링된 첫 번째(가장 가까운) 식당/카페로 이동하고 정보창을 엽니다.
            map.panTo(new kakao.maps.LatLng(filteredData[0].y, filteredData[0].x));
            setTimeout(() => openInfoWindow(filteredData[0], markers[0]), 300);

        } else {
            alert('검색 결과가 없습니다.');
        }
    }, { location: map.getCenter(), sort: kakao.maps.services.SortBy.DISTANCE }); // 카테고리 옵션 제거
}

// 6. 정보창 열기
function openInfoWindow(place, marker) {
    const menus = getDynamicMenus(place.category_name);

    let menuHtml = `<strong> 추천 메뉴</strong><ul style="padding-left: 15px;">`;
    menus.forEach(menu => {
        menuHtml += `<li style="margin-bottom: 5px;">${menu.name} - ${menu.price.toLocaleString()}원</li>`;
    });
    menuHtml += `</ul>`;

    const content = `
      <div style="padding:15px; font-size:14px; width:280px; max-height: 250px; overflow-y: auto;">
        <h4 style="margin-top:0; margin-bottom:5px;">${place.place_name}</h4>
        <p style="color: gray; font-size: 12px; margin-top:0;">${place.category_name}</p>
        <hr>
        ${menuHtml}
      </div>
    `;

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

function getDynamicMenus(category) {
    if (category.includes('치킨') || category.includes('통닭')) {
        return [{ name: "후라이드 치킨", price: 18000 }, { name: "양념 치킨", price: 19000 }, { name: "치즈볼", price: 5000 }];
    }
    if (category.includes('중식') || category.includes('중화요리')) {
        return [{ name: "짜장면", price: 6500 }, { name: "짬뽕", price: 7500 }, { name: "탕수육", price: 17000 }];
    }
    if (category.includes('커피') || category.includes('카페')) { // 💡 카페 메뉴 로직은 기존에 작성해두신 코드가 훌륭하게 작동합니다.
        return [{ name: "아메리카노", price: 4000 }, { name: "카페라떼", price: 4500 }, { name: "치즈케이크", price: 5500 }];
    }
    return [{ name: "추천 대표 메뉴", price: 9000 }, { name: "인기 사이드 메뉴", price: 5000 }, { name: "공기밥", price: 1000 }];
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

// 브라우저 창 크기가 변할 때 카카오맵의 레이아웃을 다시 계산해서 꽉 채우는 안전장치
window.addEventListener('resize', function () {
    if (map) {
        map.relayout();
    }
});