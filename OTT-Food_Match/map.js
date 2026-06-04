
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
let currentCategoryKeyword = '한식'; // 초기 기본 카테고리는 '한식'

// 1. 초기 실행: 내 위치 가져오기
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        updateMyLocation(locPosition);
        map.setCenter(locPosition);
        searchPlacesByCategory(locPosition);
    });
}

// 2. 내 위치 아이콘 표시 함수 (테마에 맞는 네온 보라색 톤 적용)
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

// 3. 지도 이벤트 설정
kakao.maps.event.addListener(map, 'idle', function () {
    if (!isSearchMode) {
        const currentCenter = map.getCenter();
        removeMarkers();
        searchPlacesByCategory(currentCenter); // 드래그 시 현재 선택된 카테고리로 갱신
    }
});

kakao.maps.event.addListener(map, 'click', function () {
    infowindow.close();
});

// 4. 우측 카테고리 버튼 이벤트 연동
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        // 스타일 액티브 상태 변경
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // 선택한 메뉴 키워드(한식, 일식 등)로 갱신 후 재검색
        currentCategoryKeyword = this.getAttribute('data-keyword');
        isSearchMode = false;
        removeMarkers();
        infowindow.close();
        searchPlacesByCategory(map.getCenter());
    });
});

// 5. 주변 검색 (현재 사이드바에 선택된 업종 기준)
function searchPlacesByCategory(pos) {
    // 카페는 CE7(카페), 나머지는 FD6(음식점) 코드 사용하여 정확도 향상
    const categoryCode = currentCategoryKeyword === '카페' ? 'CE7' : 'FD6';
    const options = {
        location: pos,
        radius: 1000,
        sort: kakao.maps.services.SortBy.DISTANCE,
        category_group_code: categoryCode
    };

    // 카테고리(FD6) + 키워드(한식, 일식 등) 조합으로 검색
    ps.keywordSearch(currentCategoryKeyword, function (data, status) {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }
        }
    }, options);
}

// 6. 직접 검색창 검색 로직 (수동 입력 시)
const searchBtn = document.getElementById('searchBtn');
const keywordInput = document.getElementById('keyword');
const cancelBtn = document.getElementById('cancelBtn');

if (searchBtn) searchBtn.addEventListener('click', searchByManualKeyword);
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
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }

            map.panTo(new kakao.maps.LatLng(data[0].y, data[0].x));
            setTimeout(() => openInfoWindow(data[0], markers[0]), 300);
        } else {
            alert('검색 결과가 없습니다.');
        }
    }, { location: map.getCenter(), sort: kakao.maps.services.SortBy.DISTANCE });
}

// 7. 마커 표시 및 정보창 렌더링
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({ map: map, position: new kakao.maps.LatLng(place.y, place.x) });
    kakao.maps.event.addListener(marker, 'click', () => openInfoWindow(place, marker));
    markers.push(marker);
}

function removeMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// 말풍선(정보창) 다크 테마 적용
function openInfoWindow(place, marker) {
    const menus = getDynamicMenus(place.category_name);
    let menuHtml = '<strong>추천 메뉴</strong><br>';
    menus.forEach(menu => { menuHtml += `${menu.name} - ${menu.price.toLocaleString()}원<br>`; });

    // 다크/네온 스타일의 정보창
    const content = `
        <div style="padding:15px; background:rgba(20,20,30,0.95); color:#fff; font-size:14px; width:230px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <strong style="font-size:16px; color:#a29bfe;">${place.place_name}</strong><br>
            <span style="color:#aaa; font-size:12px;">${place.category_name}</span>
            <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;">
            <div style="color:#ddd; line-height: 1.5;">${menuHtml}</div>
        </div>
    `;
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// 카테고리별 맞춤형 가상 메뉴 
function getDynamicMenus(category) {
    if (category.includes('치킨') || category.includes('통닭')) return [{ name: "후라이드 치킨", price: 18000 }, { name: "양념 치킨", price: 19000 }, { name: "치즈볼", price: 5000 }];
    if (category.includes('중식') || category.includes('중화요리')) return [{ name: "짜장면", price: 6500 }, { name: "짬뽕", price: 7500 }, { name: "탕수육", price: 17000 }];
    if (category.includes('커피') || category.includes('카페')) return [{ name: "아메리카노", price: 4000 }, { name: "카페라떼", price: 4500 }, { name: "치즈케이크", price: 5500 }];
    if (category.includes('일식') || category.includes('초밥')) return [{ name: "모듬초밥", price: 15000 }, { name: "돈까스", price: 10000 }];
    if (category.includes('양식') || category.includes('파스타')) return [{ name: "크림 파스타", price: 14000 }, { name: "마르게리따 피자", price: 18000 }];
    if (category.includes('분식') || category.includes('떡볶이')) return [{ name: "떡볶이", price: 4000 }, { name: "모듬튀김", price: 5000 }, { name: "순대", price: 4500 }];
    if (category.includes('패스트푸드') || category.includes('햄버거')) return [{ name: "햄버거", price: 8000 }, { name: "샌드위치", price: 6000 }];

    return [{ name: "추천 대표 메뉴", price: 9000 }, { name: "인기 사이드 메뉴", price: 5000 }, { name: "공기밥", price: 1000 }];
}

// 8. 내 위치 버튼
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
            searchPlacesByCategory(loc);
        });
    });
}
