// 지도를 표시할 div 요소를 찾습니다.
const mapContainer = document.getElementById('map');

// 지도의 초기 설정값 (중심 좌표와 확대 정도)
const mapOption = {
    // 예시 좌표: 서울숲 (러닝 경로를 테스트하기 좋은 공원 위치입니다)
    center: new kakao.maps.LatLng(37.5445888, 127.0374421),
    level: 3
};

// 1. 지도를 실제로 생성합니다.
const map = new kakao.maps.Map(mapContainer, mapOption);

// 2. (선택 사항) 중심 좌표에 빨간색 마커를 하나 올려봅니다.
const markerPosition = new kakao.maps.LatLng(37.5445888, 127.0374421);
const marker = new kakao.maps.Marker({
    position: markerPosition
});

// 마커를 지도 위에 표시합니다.
marker.setMap(map);

console.log("✅ 카카오맵 로드 및 마커 표시 완료!");