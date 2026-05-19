const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

const map = new kakao.maps.Map(mapContainer, mapOption);
const ps = new kakao.maps.services.Places(map);
const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 💡 1. 생성된 마커들을 관리하기 위한 배열입니다.
let markers = [];

// 초기 내 위치 가져오기 및 검색 실행
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(locPosition);
        searchPlaces(locPosition);
    });
}

// 💡 2. [핵심] 지도가 움직임이 멈췄을 때(idle) 발생하는 이벤트를 등록합니다.
kakao.maps.event.addListener(map, 'idle', function () {
    // 지도의 현재 중심 좌표를 얻어옵니다.
    const currentCenter = map.getCenter();

    // 기존 마커들을 싹 지우고 새로 검색합니다.
    removeMarkers();
    searchPlaces(currentCenter);
});

// 주변 음식점 검색 함수
function searchPlaces(pos) {
    ps.categorySearch('FD6', function (data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            for (let i = 0; i < data.length; i++) {
                displayPlaceMarker(data[i]);
            }
            // 다음 페이지가 있으면 45개까지 계속 호출
            if (pagination.hasNextPage) {
                pagination.nextPage();
            }
        }
    }, {
        location: pos,
        radius: 1000, // 너무 넓으면 45개 제한에 금방 걸리므로 1~1.5km를 추천합니다.
        sort: kakao.maps.services.SortBy.DISTANCE
    });
}

// 검색된 음식점 마커 표시 함수
function displayPlaceMarker(place) {
    const marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    // 💡 3. 생성된 마커를 배열에 담아둡니다 (나중에 지우기 위함).
    markers.push(marker);

    // 마커 클릭 시 가상 메뉴판 띄우기
    kakao.maps.event.addListener(marker, 'click', function () {
        const mockPrice1 = 18000;
        const mockPrice2 = 5000;

        const content = `
        <div style="padding:15px; min-width:220px; font-family: sans-serif;">
            <strong style="font-size:16px;">${place.place_name}</strong><br>
            <span style="font-size:12px; color:#666;">${place.category_name}</span>
            <hr style="margin: 10px 0; border:0; border-top: 1px solid #eee;">
            
            <p style="margin:0 0 8px 0; font-size:13px; font-weight:bold;">🔥 추천 메뉴</p>
            
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:13px;">대표 세트 메뉴</span>
                <button onclick="window.addToCart('${place.place_name}', '대표 세트 메뉴', ${mockPrice1})" style="cursor:pointer; background:#fff; border:1px solid #ff6b6b; color:#ff6b6b; border-radius:3px; font-size:11px; padding:3px 6px;">담기</button>
            </div>
            
            <div style="display:flex; justify-content:space-between;">
                <span style="font-size:13px;">사이드 메뉴</span>
                <button onclick="window.addToCart('${place.place_name}', '사이드 메뉴', ${mockPrice2})" style="cursor:pointer; background:#fff; border:1px solid #ff6b6b; color:#ff6b6b; border-radius:3px; font-size:11px; padding:3px 6px;">담기</button>
            </div>
        </div>
        `;
        infowindow.setContent(content);
        infowindow.open(map, marker);
    });
}

// 💡 4. 지도 위에 표시되고 있는 마커들을 모두 제거하는 함수입니다.
function removeMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
} // 🚨 여기에 닫는 괄호(})가 빠져서 에러가 났었습니다!


// ==========================================
// 여기서부터 장바구니 관련 로직입니다.
// ==========================================

// 전역 변수로 장바구니 배열 생성
window.cart = [];

// 장바구니에 메뉴를 담는 함수
window.addToCart = function (storeName, menuName, price) {
    cart.push({ storeName: storeName, menuName: menuName, price: price });
    updateCartUI();
    console.log(`${menuName} 메뉴가 장바구니에 담겼습니다!`);
};

// 새로 추가된 함수: 장바구니에서 특정 메뉴 삭제하기
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
document.getElementById("orderBtn").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("장바구니가 비어있습니다. 메뉴를 먼저 담아주세요!");
        return;
    }

    const confirmOrder = confirm(`총 ${document.getElementById("totalPrice").textContent}입니다. 결제하시겠습니까?`);

    if (confirmOrder) {
        alert("🎉 주문이 완료되었습니다! 라이더가 곧 배정을 받습니다.");
        cart = [];
        updateCartUI();
    }
}); // 🚨 맨 끝에 있던 }}; 를 올바르게 }); 로 수정했습니다!