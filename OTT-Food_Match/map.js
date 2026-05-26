const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places(map);
const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 생성된 마커들을 관리하기 위한 배열
let markers = [];

// 초기 내 위치 가져오기 및 검색 실행
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(locPosition);
        searchPlaces(locPosition);
    });
}

// 2. 지도가 움직임이 멈췄을 때(idle) 발생하는 이벤트를 등록
kakao.maps.event.addListener(map, 'idle', function () {
    const currentCenter = map.getCenter();
    removeMarkers();
    searchPlaces(currentCenter);
});

kakao.maps.event.addListener(map, 'click', function () {
    infowindow.close();
});

// 주변 음식점 검색 함수 (카카오맵 API)
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

// 검색된 음식점 마커 표시 및 클릭 시 가상 메뉴 띄우기
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    // 마커를 클릭했을 때 발생하는 이벤트 (API 통신 없이 바로 가상 메뉴 생성)
    kakao.maps.event.addListener(marker, 'click', function () {
        const restaurantName = place.place_name;
        const fallbackMenus = getDynamicMenus(place.category_name);

        let menuHtml = `<strong>💡 추천 가상 메뉴</strong><ul style="padding-left: 15px;">`;

        fallbackMenus.forEach(menu => {
            menuHtml += `
           <li style="margin-bottom: 5px;">
             ${menu.name} - ${menu.price.toLocaleString()}원
             <button onclick="window.addToCart('${restaurantName}', '${menu.name}', ${menu.price})" style="margin-left: 5px;">담기</button>
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

// 4. 지도 위에 표시되고 있는 마커들을 모두 제거하는 함수
function removeMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// 전역 변수로 장바구니 배열 생성
window.cart = [];

// 장바구니에 메뉴를 담는 함수
window.addToCart = function (storeName, menuName, price) {
    cart.push({ storeName: storeName, menuName: menuName, price: price });
    updateCartUI();
    console.log(`${menuName} 메뉴가 장바구니에 담겼습니다!`);
};

// 장바구니에서 특정 메뉴 삭제하기
window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartUI();
};

// 장바구니 화면 업데이트 함수
function updateCartUI() {
    const cartList = document.getElementById("cartList");
    const totalPriceEl = document.getElementById("totalPrice");

    if (cart.length === 0) {
        cartList.innerHTML = '<li style="color: #888;">아직 담은 메뉴가 없습니다.</li>';
        totalPriceEl.textContent = "0원";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach((item, index) => {
        html += `
            <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px;">
                <div style="flex-grow: 1;">
                    <span style="font-size: 11px; color: #888;">${item.storeName}</span><br>
                    <strong>${item.menuName}</strong>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>${item.price.toLocaleString()}원</span>
                    <button onclick="window.removeFromCart(${index})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 12px; padding: 2px 5px; border-radius: 3px; border: 1px solid #ffe3e3;">삭제</button>
                </div>
            </li>
        `;
        total += item.price;
    });

    cartList.innerHTML = html;
    totalPriceEl.textContent = `${total.toLocaleString()}원`;
}

// 주문하기 버튼 이벤트
const orderBtn = document.getElementById("orderBtn");

if (orderBtn) {
    orderBtn.addEventListener("click", () => {
        if (!cart || cart.length === 0) {
            alert("장바구니가 비어있습니다. 메뉴를 먼저 담아주세요!");
            return;
        }

        const totalPriceElement = document.getElementById("totalPrice");
        const priceText = totalPriceElement ? totalPriceElement.textContent : "0원";
        const confirmOrder = confirm(`총 ${priceText}입니다. 결제하시겠습니까?`);

        if (confirmOrder) {
            alert("🎉 주문이 완료되었습니다! 라이더가 곧 배정을 받습니다.");
            cart = [];
            if (typeof updateCartUI === "function") {
                updateCartUI();
            }
        }
    });
}

function getDynamicMenus(categoryName) {
    // 카테고리 이름에 특정 단어가 포함되어 있는지 확인하여 가상 메뉴를 반환
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
        // 그 외 일반적인 식당용 가상 메뉴
        return [
            { name: "추천 대표 메뉴", price: 9000 },
            { name: "인기 사이드 메뉴", price: 5000 },
            { name: "공기밥", price: 1000 }
        ];
    }
}