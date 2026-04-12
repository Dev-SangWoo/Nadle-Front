import { apiFetch } from '@/api/client'

const NEARBY_PATH = '/api/v1/spots/nearby'

function detailPath(spotId) {
  const id = encodeURIComponent(String(spotId).trim())
  return `/api/v1/spots/${id}`
}

/** 2km 반경에서 뽑을 후보 풀 크기 (랜덤 3개 선택용) */
const DEFAULT_FETCH_SIZE = 50

/** 기본 랜덤 선택 개수 */
const DEFAULT_PICK_COUNT = 3

/**
 * @param {unknown} json
 * @returns {object[]}
 */
function extractSpotList(json) {
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object') {
    // Nadle 백엔드: { result: { spots: [...] } }
    if (Array.isArray(json.result?.spots)) return json.result.spots
    if (Array.isArray(json.result?.content)) return json.result.content
    if (Array.isArray(json.content)) return json.content
    if (json.data !== undefined) {
      if (Array.isArray(json.data)) return json.data
      if (json.data && Array.isArray(json.data.content)) return json.data.content
      if (Array.isArray(json.data?.spots)) return json.data.spots
    }
    if (Array.isArray(json.items)) return json.items
    if (Array.isArray(json.results)) return json.results
  }
  return []
}

function toImageArray(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String)
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()]
  return []
}

/**
 * 백엔드 spot → 화면용 destination
 * @param {Record<string, unknown>} raw
 * @returns {object | null}
 */
export function mapApiSpotToDestination(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.spotId ?? raw.id ?? raw.contentId
  if (id == null) return null

  // routes/recommend 등: mapy=위도, mapx=경도 (한국관광공사 API 관례)
  const lat = Number(raw.lat ?? raw.latitude ?? raw.mapy)
  const lng = Number(raw.lng ?? raw.longitude ?? raw.lon ?? raw.mapx)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const name = String(raw.spotName ?? raw.name ?? raw.title ?? '이름 없음')
  const description = String(
    raw.description ??
      raw.overview ??
      raw.intro ??
      raw.summary ??
      raw.reason ??
      ''
  )
  const address = String(raw.address ?? raw.addr ?? raw.roadAddress ?? '')
  const category = String(raw.category ?? 'TOUR').toUpperCase()
  const telRaw = raw.tel ?? raw.phone ?? raw.telephone
  const tel = telRaw != null && String(telRaw).trim() ? String(telRaw).trim() : null

  const images = toImageArray(raw.images ?? raw.imageUrls ?? raw.imageUrl)

  return {
    spotId: String(id),
    spotName: name,
    description: description || `${name} 주변 관광지입니다.`,
    category: ['TOUR', 'FOOD', 'CULTURE', 'NATURE'].includes(category)
      ? category
      : 'TOUR',
    address: address || '주소 정보 없음',
    lat,
    lng,
    images,
    tel
  }
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} count
 * @returns {T[]}
 */
export function pickRandomUnique(items, count) {
  const copy = [...items]
  shuffleInPlace(copy)
  const out = []
  const seen = new Set()
  for (const item of copy) {
    const id = item?.spotId
    if (id == null || seen.has(id)) continue
    seen.add(id)
    out.push(item)
    if (out.length >= count) break
  }
  return out
}

/**
 * 주변 관광지 목록 조회 (GET /api/v1/spots/nearby)
 *
 * @param {object} params
 * @param {number} params.lat
 * @param {number} params.lng
 * @param {number} [params.radius=3000] m
 * @param {string} [params.category] TOUR | FOOD | CULTURE | NATURE
 * @param {number} [params.page=1]
 * @param {number} [params.size=20]
 * @returns {Promise<object[]>} 원본 객체 배열
 */
export async function fetchNearbySpotsRaw(params) {
  const {
    lat,
    lng,
    radius = 3000,
    category,
    page = 1,
    size = 20
  } = params

  const q = new URLSearchParams()
  q.set('lat', String(lat))
  q.set('lng', String(lng))
  q.set('radius', String(radius))
  q.set('page', String(page))
  q.set('size', String(size))
  if (category) q.set('category', category)

  const res = await apiFetch(`${NEARBY_PATH}?${q.toString()}`)
  if (!res.ok) {
    let detail = res.statusText
    try {
      const errBody = await res.text()
      if (errBody) detail = errBody.slice(0, 200)
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }

  const json = await res.json()
  if (json && typeof json === 'object' && json.success === false) {
    throw new Error(String(json.message || '주변 관광지 조회에 실패했습니다.'))
  }
  return extractSpotList(json)
}

/**
 * 반경 2km 내 후보를 받아 무작위로 `count`개 destination 생성 (AI 연동 전 임시 코스)
 *
 * @param {number} lat
 * @param {number} lng
 * @param {object} [options]
 * @param {number} [options.count=3]
 * @param {number} [options.radiusM=2000]
 * @param {number} [options.poolSize=50] 한 페이지에서 가져올 최대 개수
 * @param {string} [options.category]
 * @returns {Promise<object[]>} SpotDetailSheet / 지도와 호환되는 destination 배열
 */
export async function fetchRandomNearbyDestinations(lat, lng, options = {}) {
  const {
    count = DEFAULT_PICK_COUNT,
    radiusM = 2000,
    poolSize = DEFAULT_FETCH_SIZE,
    category
  } = options

  const rawList = await fetchNearbySpotsRaw({
    lat,
    lng,
    radius: radiusM,
    category,
    page: 1,
    size: poolSize
  })

  const mapped = rawList
    .map((row) => mapApiSpotToDestination(row))
    .filter(Boolean)

  return pickRandomUnique(mapped, count)
}

/**
 * 관광지 상세 조회 GET /api/v1/spots/{spotId}
 * @param {string} spotId
 * @returns {Promise<object>}
 */
export async function fetchSpotDetail(spotId) {
  if (spotId == null || String(spotId).trim() === '') {
    throw new Error('spotId가 필요합니다.')
  }

  const res = await apiFetch(detailPath(spotId))
  if (!res.ok) {
    let detail = res.statusText
    try {
      const errBody = await res.text()
      if (errBody) detail = errBody.slice(0, 200)
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }

  const json = await res.json()
  if (json && typeof json === 'object' && json.success === false) {
    throw new Error(String(json.message || '관광지 상세 조회에 실패했습니다.'))
  }

  const raw = json?.result
  if (!raw || typeof raw !== 'object') {
    throw new Error('관광지 정보 형식이 올바르지 않습니다.')
  }

  const mapped = mapApiSpotToDestination(raw)
  if (!mapped) {
    throw new Error('관광지 정보를 표시할 수 없습니다.')
  }
  return mapped
}

function quizPath(spotId) {
  const id = encodeURIComponent(String(spotId).trim())
  return `/api/v1/spots/${id}/quiz`
}

/**
 * 관광지 O/X 퀴즈 GET /api/v1/spots/{spotId}/quiz
 * @param {string} spotId — contentId 등 관광지 고유 ID
 * @returns {Promise<{ text: string, answer: boolean, explanation: string }>}
 */
export async function fetchSpotQuiz(spotId) {
  if (spotId == null || String(spotId).trim() === '') {
    throw new Error('spotId가 필요합니다.')
  }

  const res = await apiFetch(quizPath(spotId))
  if (!res.ok) {
    let detail = res.statusText
    try {
      const errBody = await res.text()
      if (errBody) detail = errBody.slice(0, 200)
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }

  const json = await res.json()
  const ok =
    json &&
    typeof json === 'object' &&
    (json.isSuccess === true ||
      json.success === true ||
      json.code === 200)

  if (json && typeof json === 'object' && json.success === false) {
    throw new Error(String(json.message || '퀴즈 조회에 실패했습니다.'))
  }
  if (json && typeof json === 'object' && json.isSuccess === false) {
    throw new Error(String(json.message || '퀴즈 조회에 실패했습니다.'))
  }
  if (!ok) {
    throw new Error(
      String(json?.message || '퀴즈를 불러오지 못했습니다.')
    )
  }

  const r = json?.result
  if (!r || typeof r !== 'object') {
    throw new Error('퀴즈 데이터가 없습니다.')
  }

  const text = String(r.question ?? '').trim()
  if (!text) {
    throw new Error('퀴즈 문항이 비어 있습니다.')
  }

  const answer =
    r.answer === true ||
    r.answer === 'true' ||
    r.answer === 1 ||
    r.answer === 'O' ||
    r.answer === 'o'

  const explanation =
    String(r.explanation ?? '').trim() || '설명이 없습니다.'

  return { text, answer, explanation }
}
