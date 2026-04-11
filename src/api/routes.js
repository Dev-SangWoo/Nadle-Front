import { apiFetch } from '@/api/client'
import { mapApiSpotToDestination } from '@/api/spots'

const RECOMMEND_PATH = '/api/v1/routes/recommend'

/**
 * @param {unknown} json
 * @returns {object[]}
 */
function extractRouteSpots(json) {
  if (Array.isArray(json)) return json
  if (!json || typeof json !== 'object') return []
  const r = json.result
  if (r && typeof r === 'object') {
    if (Array.isArray(r.spots)) return r.spots
    if (Array.isArray(r.destinations)) return r.destinations
    if (Array.isArray(r.waypoints)) return r.waypoints
    if (Array.isArray(r.stopovers)) return r.stopovers
    if (Array.isArray(r.route)) return r.route
    if (r.route && typeof r.route === 'object' && Array.isArray(r.route.spots)) {
      return r.route.spots
    }
  }
  if (Array.isArray(json.spots)) return json.spots
  if (Array.isArray(json.destinations)) return json.destinations
  return []
}

/**
 * AI 코스 추천 GET /api/v1/routes/recommend
 *
 * @param {object} params
 * @param {number} params.stationLat
 * @param {number} params.stationLng
 * @param {number} [params.duration=120] 분
 * @param {string} [params.prompt] 테마·조정 요청 등 (백엔드가 지원 시)
 * @returns {Promise<object[]>} 원본 spot 배열
 */
export async function fetchRouteRecommendRaw(params) {
  const {
    stationLat,
    stationLng,
    duration = 120,
    prompt
  } = params

  const q = new URLSearchParams()
  q.set('stationLat', String(stationLat))
  q.set('stationLng', String(stationLng))
  q.set('duration', String(duration ?? 120))
  const p = prompt != null ? String(prompt).trim() : ''
  if (p) q.set('prompt', p)

  const res = await apiFetch(`${RECOMMEND_PATH}?${q.toString()}`)
  if (!res.ok) {
    let detail = res.statusText
    try {
      const errBody = await res.text()
      if (errBody) detail = errBody.slice(0, 300)
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }

  const json = await res.json()
  if (json && typeof json === 'object' && json.success === false) {
    throw new Error(String(json.message || '코스 추천에 실패했습니다.'))
  }

  return extractRouteSpots(json)
}

/**
 * 추천 결과 → 지도/상세용 destination 목록
 * @param {object} params — fetchRouteRecommendRaw 와 동일
 */
export async function fetchRouteRecommendDestinations(params) {
  const rawList = await fetchRouteRecommendRaw(params)
  return rawList.map((row) => mapApiSpotToDestination(row)).filter(Boolean)
}
