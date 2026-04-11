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
 * @param {Response} res
 * @returns {Promise<object[]>}
 */
async function parseRecommendResponse(res) {
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
 * AI 코스 추천 /api/v1/routes/recommend
 * - GET: 쿼리에 줄바꿈이 들어가면 일부 프록시에서 502가 날 수 있어 requirements 는 공백으로 합침
 * - GET 이 502/503/504 이면 POST(JSON) 한 번 재시도 (백엔드가 본문만 받는 경우 대비)
 *
 * @param {object} params
 * @param {number} params.stationLat
 * @param {number} params.stationLng
 * @param {number} [params.duration=120] 분
 * @param {string} [params.requirements] 사용자 경로 요구사항
 * @returns {Promise<object[]>} 원본 spot 배열
 */
export async function fetchRouteRecommendRaw(params) {
  const {
    stationLat,
    stationLng,
    duration = 120,
    requirements
  } = params

  const lat = Number(stationLat)
  const lng = Number(stationLng)
  const dur = Number(duration ?? 120) || 120
  const req = requirements != null ? String(requirements).trim() : ''
  const reqForQuery = req ? req.replace(/\s+/g, ' ').trim() : ''

  const q = new URLSearchParams()
  q.set('stationLat', String(lat))
  q.set('stationLng', String(lng))
  q.set('duration', String(dur))
  if (reqForQuery) q.set('requirements', reqForQuery)

  let res = await apiFetch(`${RECOMMEND_PATH}?${q.toString()}`)

  const retryable = res.status === 502 || res.status === 503 || res.status === 504
  if (retryable) {
    const body = { stationLat: lat, stationLng: lng, duration: dur }
    if (req) body.requirements = req
    res = await apiFetch(RECOMMEND_PATH, { method: 'POST', body })
  }

  return parseRecommendResponse(res)
}

/**
 * 추천 결과 → 지도/상세용 destination 목록
 * @param {object} params — fetchRouteRecommendRaw 와 동일
 */
export async function fetchRouteRecommendDestinations(params) {
  const rawList = await fetchRouteRecommendRaw(params)
  return rawList.map((row) => mapApiSpotToDestination(row)).filter(Boolean)
}
