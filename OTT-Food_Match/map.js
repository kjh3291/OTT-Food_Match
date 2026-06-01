const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places(map);
const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

let markers = [];
// 💡 안전장치: 현재 사용자가 '검색'을 한 상태인지 확인하는 변수
let isSearchMode = false;

// 초기 내 위치 가져오기 및 검색 실행
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(locPosition);
        searchPlaces(locPosition);
    });
}

// 💡 수정됨: 지도가 움직임이 멈췄을 때 발생하는 이벤트
kakao.maps.event.addListener(map, 'idle', function () {
    // 검색 모드가 아닐 때(그냥 지도를 드래그할 때)만 주변 식당을 자동으로 불러옵니다.
    if (!isSearchMode) {
        const currentCenter = map.getCenter();
        removeMarkers();
        searchPlaces(currentCenter);
    }
});

kakao.maps.event.addListener(map, 'click', function () {
    infowindow.close();
});

// 주변 음식점 검색 함수 (기존 유지)
function searchPlaces(pos) {
    ps.categorySearch('FD6', function (data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }
            if (pagination.hasNextPage) {
                pagination.nextPage();
            }
        }
    }, {
        location: pos,
        radius: 1000,
        sort: kakao.maps.services.SortBy.DISTANCE
    });
}

// [새로 추가된 부분] 키워드로 특정 식당 검색하기
const searchBtn = document.getElementById('searchBtn');
const keywordInput = document.getElementById('keyword');
const cancelBtn = document.getElementById('cancelBtn'); // 취소 버튼 요소 가져오기

if (searchBtn && keywordInput) {
    // 검색 버튼 클릭 시
    searchBtn.addEventListener('click', searchByKeyword);
    // 엔터키 입력 시
    keywordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') searchByKeyword();
    });
}

// 취소 버튼 클릭 이벤트 추가
if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
        // 1. 검색어 초기화
        keywordInput.value = '';

        // 2. 검색 모드 해제
        isSearchMode = false;

        // 3. 현재 지도 중심 위치로 다시 주변 식당 검색
        searchPlaces(map.getCenter());
    });
}

function searchByKeyword() {
    const keyword = keywordInput.value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('검색어를 입력해주세요!');
        isSearchMode = false; // 검색어가 없으면 다시 주변 자동 탐색 모드로 복귀
        searchPlaces(map.getCenter());
        return;
    }

    // 검색 모드 ON: 지도가 자동으로 마커를 덮어씌우는 것을 막습니다.
    isSearchMode = true;

    // 카카오맵 장소 검색 (음식점 FD6 카테고리 안에서만 검색되도록 제한)
    ps.keywordSearch(keyword, function (data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            removeMarkers(); // 기존에 있던 주변 마커들 싹 지우기

            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }

            // 💡 [핵심] 검색 결과 중 가장 첫 번째(가장 가까운) 식당의 좌표 계산
            const nearestPlace = data[0];
            const moveLatLon = new kakao.maps.LatLng(nearestPlace.y, nearestPlace.x);

            // 지도의 중심을 가장 가까운 식당으로 '부드럽게(panTo)' 이동시킵니다.
            map.panTo(moveLatLon);

            // 💡 [새로 추가된 부분] 이동한 후, 가장 가까운 식당(첫 번째 마커)의 정보창을 자동으로 띄웁니다!
            openInfoWindow(nearestPlace, markers[0]);

        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 존재하지 않습니다.');
        } else if (status === kakao.maps.services.Status.ERROR) {
            alert('검색 도중 오류가 발생했습니다.');
        }
    }, {
        category_group_code: 'FD6',
        location: map.getCenter(), // 💡 현재 화면의 중심점을 기준으로
        sort: kakao.maps.services.SortBy.DISTANCE // 💡 거리가 가장 가까운 순서대로 정렬해서 가져옵니다!
    });
}

// 💡 [새로 추가된 함수] 마커에 해당하는 식당의 정보창(말풍선)을 열어주는 역할만 전담합니다.
function openInfoWindow(place, marker) {
    const restaurantName = place.place_name;
    const fallbackMenus = getDynamicMenus(place.category_name);

    let menuHtml = `<strong> 추천 메뉴</strong><ul style="padding-left: 15px;">`;

    fallbackMenus.forEach(menu => {
        menuHtml += `
           <li style="margin-bottom: 5px;">
             ${menu.name} - ${menu.price.toLocaleString()}원
           </li>`;
    });
    menuHtml += `</ul>`;

    const content = `
      <div style="padding:15px; font-size:14px; width:280px; max-height: 250px; overflow-y: auto;">
        <h4 style="margin-top:0; margin-bottom:5px;">${restaurantName}</h4>
        <p style="color: gray; font-size: 12px; margin-top:0;">${place.category_name}</p>
        <hr>
        ${menuHtml}
      </div>
    `;

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// 검색된 음식점 마커 표시 (클릭 이벤트 수정)
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    kakao.maps.event.addListener(marker, 'click', function () {
        // 💡 분리해둔 함수를 호출하기만 하면 코드가 훨씬 깔끔해집니다.
        openInfoWindow(place, marker);
    });

    markers.push(marker);
}

// 검색된 음식점 마커 표시 및 클릭 시 가상 메뉴 띄우기 (기존 유지)
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    kakao.maps.event.addListener(marker, 'click', function () {
        const restaurantName = place.place_name;
        const fallbackMenus = getDynamicMenus(place.category_name);

        let menuHtml = `<strong> 추천 메뉴</strong><ul style="padding-left: 15px;">`;

        fallbackMenus.forEach(menu => {
            menuHtml += `
           <li style="margin-bottom: 5px;">
             ${menu.name} - ${menu.price.toLocaleString()}원
           </li>`;
        });
        menuHtml += `</ul>`;

        const content = `
          <div style="padding:15px; font-size:14px; width:280px; max-height: 250px; overflow-y: auto;">
            <h4 style="margin-top:0; margin-bottom:5px;">${restaurantName}</h4>
            <p style="color: gray; font-size: 12px; margin-top:0;">${place.category_name}</p>
            <hr>
            ${menuHtml}
          </div>
        `;

        infowindow.setContent(content);
        infowindow.open(map, marker);
    });

    markers.push(marker);
}

// 지도 위에 표시되고 있는 마커들을 모두 제거하는 함수 (기존 유지)
function removeMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// 카테고리별 동적(가상) 메뉴 반환 함수 (기존 유지)
function getDynamicMenus(categoryName) {
    if (categoryName.includes('치킨') || categoryName.includes('통닭')) {
        return [
            { name: "후라이드 치킨", price: 18000 },
            { name: "양념 치킨", price: 19000 },
            { name: "치즈볼", price: 5000 }
        ];
    } else if (categoryName.includes('중식') || categoryName.includes('중화요리')) {
        return [
            { name: "짜장면", price: 6500 },
            { name: "짬뽕", price: 7500 },
            { name: "탕수육", price: 17000 }
        ];
    } else if (categoryName.includes('커피') || categoryName.includes('카페')) {
        return [
            { name: "아메리카노", price: 4000 },
            { name: "카페라떼", price: 4500 },
            { name: "치즈케이크", price: 5500 }
        ];
    } else {
        return [
            { name: "추천 대표 메뉴", price: 9000 },
            { name: "인기 사이드 메뉴", price: 5000 },
            { name: "공기밥", price: 1000 }
        ];
    }
}

// 💡 [새로 추가된 부분] 내 위치 버튼 클릭 이벤트
const myLocationBtn = document.getElementById('myLocationBtn');

if (myLocationBtn) {
    myLocationBtn.addEventListener('click', function () {
        // 위치 정보를 지원하는 브라우저인지 확인
        if (navigator.geolocation) {

            // 버튼을 누르는 순간의 최신 위치를 다시 가져옵니다.
            navigator.geolocation.getCurrentPosition(function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const locPosition = new kakao.maps.LatLng(lat, lng);

                // 1. 지도 중심을 내 위치로 '부드럽게' 이동
                map.panTo(locPosition);

                // 2. 검색 모드를 해제하여 지도 이동 시 주변 탐색이 가능하게 복구
                isSearchMode = false;
                if (document.getElementById('keyword')) {
                    document.getElementById('keyword').value = ''; // 검색어 창 비우기
                }

                // 3. 최신 위치를 localStorage에 갱신해서 저장 (이전 설정과 연동)
                localStorage.setItem("myLocation", JSON.stringify({ lat: lat, lng: lng }));

                // 4. 내 위치 주변 식당 다시 검색
                removeMarkers();
                searchPlaces(locPosition);

            }, function (error) {
                alert("현재 위치 정보를 가져올 수 없습니다.");
                console.error(error);
            });

        } else {
            alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
        }
    });
}