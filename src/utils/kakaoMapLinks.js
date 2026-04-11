/**
 * 카카오맵 웹 링크 (공식 패턴)
 * @see https://apis.map.kakao.com/web/guide/
 */

/** 이름에 쉼표가 있으면 길찾기 URL 파싱이 깨지므로 제거 */
function safePlaceLabel(name) {
  return String(name ?? '장소')
    .trim()
    .replace(/,/g, ' ')
    .slice(0, 80) || '장소'
}

/**
 * 내 위치 → 목적지, 이동수단 자전거(bicycle)
 * @param {number} fromLat
 * @param {number} fromLng
 * @param {string} toName
 * @param {number} toLat
 * @param {number} toLng
 * @param {string} [fromName='내 위치']
 */
export function kakaoBicycleRouteUrl(fromLat, fromLng, toName, toLat, toLng, fromName = '내 위치') {
  const f = safePlaceLabel(fromName)
  const t = safePlaceLabel(toName)
  return `https://map.kakao.com/link/by/bicycle/${encodeURIComponent(f)},${fromLat},${fromLng}/${encodeURIComponent(t)},${toLat},${toLng}`
}

/** 위치만 표시 (지도에서 보기) */
export function kakaoMapPlaceUrl(name, lat, lng) {
  const n = safePlaceLabel(name)
  return `https://map.kakao.com/link/map/${encodeURIComponent(n)},${lat},${lng}`
}

/**
 * 목적지 길찾기만 연결 (출발은 카카오맵에서 설정)
 * 위치 정보 없을 때 폴백용
 */
export function kakaoRouteToOnlyUrl(name, lat, lng) {
  const n = safePlaceLabel(name)
  return `https://map.kakao.com/link/to/${encodeURIComponent(n)},${lat},${lng}`
}
