import { apiFetch } from '@/api/client'

const NEARBY_PATH = '/api/v1/stations/nearby'

function stationDetailPath(stationId) {
  const id = encodeURIComponent(String(stationId ?? '').trim())
  return `/api/v1/stations/${id}`
}

/** 검색 반경(m) — 백엔드 기본 1000, 상한 5000 */
const DEFAULT_RADIUS_M = 1000
const MAX_RADIUS_M = 5000

/**
 * API 실패 시 근처 목록용 목업 (백엔드 result[] 필드와 동일 계열)
 * 상세는 같은 행에서 address·operatingHours·status 를 사용
 */
const MOCK_NEARBY_RAW = [
  {
    stationId: 'MOCK-001',
    stationName: '광화문역 1번 출구',
    lat: 37.5716,
    lng: 126.9768,
    rackTotCnt: 20,
    parkingBikeTotCnt: 8,
    distance: 120,
    address: '서울특별시 종로구 세종대로 지하 176',
    operatingHours: '24시간',
    status: 'ACTIVE'
  },
  {
    stationId: 'MOCK-002',
    stationName: '경복궁 서측',
    lat: 37.5779,
    lng: 126.975,
    rackTotCnt: 18,
    parkingBikeTotCnt: 3,
    distance: 250,
    address: '서울특별시 종로구 사직로 161',
    operatingHours: '24시간',
    status: 'ACTIVE'
  },
  {
    stationId: 'MOCK-003',
    stationName: '세종문화회관 앞',
    lat: 37.5724,
    lng: 126.976,
    rackTotCnt: 22,
    parkingBikeTotCnt: 12,
    distance: 310,
    address: '서울특별시 종로구 세종대로 175',
    operatingHours: '06:00 ~ 23:00',
    status: 'ACTIVE'
  },
  {
    stationId: 'MOCK-004',
    stationName: '광화문 광장 서편',
    lat: 37.5728,
    lng: 126.9774,
    rackTotCnt: 16,
    parkingBikeTotCnt: 5,
    distance: 195,
    address: '서울특별시 종로구 세종대로',
    operatingHours: '24시간',
    status: 'ACTIVE'
  },
  {
    stationId: 'MOCK-005',
    stationName: '덕수궁 돌담길',
    lat: 37.5658,
    lng: 126.9751,
    rackTotCnt: 15,
    parkingBikeTotCnt: 15,
    distance: 890,
    address: '서울특별시 중구 정동',
    operatingHours: '24시간',
    status: 'ACTIVE'
  },
  {
    stationId: 'MOCK-006',
    stationName: '서소문',
    lat: 37.5633,
    lng: 126.968,
    rackTotCnt: 12,
    parkingBikeTotCnt: 6,
    distance: 1120,
    address: '서울특별시 중구 서소문로',
    operatingHours: '24시간',
    status: 'INACTIVE'
  }
]

function mockNearbyMapped(refLat, refLng) {
  return MOCK_NEARBY_RAW.map((row) => mapStationRaw(row, refLat, refLng)).filter(
    Boolean
  )
}

function mockRowToDetailRaw(row) {
  return {
    stationId: row.stationId,
    stationName: row.stationName,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    totalSlots: row.rackTotCnt,
    availableBikes: row.parkingBikeTotCnt,
    operatingHours: row.operatingHours,
    status: row.status
  }
}

function mockStationDetailById(stationId) {
  const row = MOCK_NEARBY_RAW.find((r) => String(r.stationId) === String(stationId))
  const raw = row
    ? mockRowToDetailRaw(row)
    : {
        stationId,
        stationName: '샘플 대여소 (목업)',
        address: '서울특별시 중구 세종대로 110 (목업)',
        lat: 37.5665,
        lng: 126.978,
        totalSlots: 20,
        availableBikes: 8,
        operatingHours: '24시간',
        status: 'ACTIVE'
      }
  return mapStationDetail(raw)
}


/**
 * 근처 대여소 API 응답 (참고)
 * {
 *   isSuccess, code, message,
 *   result: [{
 *     stationId, stationName, lat, lng,
 *     rackTotCnt, parkingBikeTotCnt, distance
 *   }]
 * }
 * — parkingBikeTotCnt: 대여 가능 자전거 수, 빈 거치대는 rackTotCnt - parkingBikeTotCnt 로 산출
 *
 * @param {unknown} json
 * @returns {object[]}
 */
function extractStationList(json) {
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object') {
    if (Array.isArray(json.result)) return json.result
    if (Array.isArray(json.result?.stations)) return json.result.stations
    if (Array.isArray(json.result?.content)) return json.result.content
    if (Array.isArray(json.data)) return json.data
    if (json.data && Array.isArray(json.data.content)) return json.data.content
    if (Array.isArray(json.items)) return json.items
  }
  return []
}

/**
 * @param {unknown} json
 * @returns {Record<string, unknown> | null}
 */
function extractStationDetailResult(json) {
  if (!json || typeof json !== 'object') return null
  const r = json.result
  if (r && typeof r === 'object' && !Array.isArray(r)) return /** @type {Record<string, unknown>} */ (r)
  return null
}

function assertStationsApiEnvelope(json) {
  if (!json || typeof json !== 'object') return
  if (json.isSuccess === false) {
    throw new Error(String(json.message ?? '대여소 조회에 실패했습니다.'))
  }
  if ('code' in json && json.code !== 200) {
    throw new Error(String(json.message ?? '대여소 조회에 실패했습니다.'))
  }
  if (json.success === false) {
    throw new Error(String(json.message ?? '대여소 조회에 실패했습니다.'))
  }
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 백엔드 대여소 1건 → 거리·잔여 등 통일
 * (표준 필드: stationId, stationName, lat, lng, rackTotCnt, parkingBikeTotCnt, distance)
 * @param {Record<string, unknown>} raw
 * @param {number} refLat
 * @param {number} refLng
 */
export function mapStationRaw(raw, refLat, refLng) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.stationId ?? raw.id ?? raw.stationIdx
  if (id == null) return null

  const name = String(raw.stationName ?? raw.name ?? raw.title ?? '대여소')
  const lat = Number(raw.lat ?? raw.latitude ?? raw.mapy)
  const lng = Number(raw.lng ?? raw.longitude ?? raw.lon ?? raw.mapx)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  let distance = Number(raw.distance ?? raw.dist ?? raw.distanceM ?? NaN)
  if (
    !Number.isFinite(distance) &&
    Number.isFinite(refLat) &&
    Number.isFinite(refLng)
  ) {
    distance = haversineMeters(refLat, refLng, lat, lng)
  }
  if (!Number.isFinite(distance)) distance = 0

  const parked = Number(
    raw.parkingBikeTotCnt ??
      raw.parkedBikeCount ??
      raw.bikeCount ??
      raw.availableBikes ??
      raw.availableBikeCount ??
      raw.available ??
      NaN
  )
  const rackTotal = Number(
    raw.rackTotCnt ?? raw.totalRack ?? raw.totalSlot ?? raw.rackCount ?? NaN
  )
  const emptyDirect = Number(
    raw.emptySlot ?? raw.emptySlots ?? raw.emptyRack ?? raw.empty ?? NaN
  )

  let bikeCount = Number.isFinite(parked) ? Math.max(0, Math.floor(parked)) : 0
  let emptyCount = Number.isFinite(emptyDirect)
    ? Math.max(0, Math.floor(emptyDirect))
    : 0
  if (Number.isFinite(rackTotal) && Number.isFinite(parked) && !Number.isFinite(emptyDirect)) {
    emptyCount = Math.max(0, Math.floor(rackTotal) - bikeCount)
  }

  return {
    id: String(id),
    name,
    lat,
    lng,
    distance: Math.round(distance),
    bikeCount,
    emptyCount
  }
}

/**
 * GET /api/v1/stations/{stationId} 단건 → 화면용
 * (result: stationId, stationName, address, lat, lng, totalSlots, availableBikes, operatingHours, status)
 * @param {Record<string, unknown>} raw
 */
export function mapStationDetail(raw) {
  if (!raw || typeof raw !== 'object') return null

  const stationId = raw.stationId ?? raw.id
  if (stationId == null) return null

  const stationName = String(raw.stationName ?? raw.name ?? '대여소')
  const address = String(raw.address ?? '')
  const lat = Number(raw.lat ?? raw.latitude)
  const lng = Number(raw.lng ?? raw.longitude ?? raw.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const totalSlots = Number(raw.totalSlots ?? raw.rackTotCnt ?? NaN)
  const availableBikes = Number(raw.availableBikes ?? raw.parkingBikeTotCnt ?? NaN)
  const total = Number.isFinite(totalSlots) ? Math.max(0, Math.floor(totalSlots)) : null
  const bikes = Number.isFinite(availableBikes) ? Math.max(0, Math.floor(availableBikes)) : null
  const emptySlots =
    total != null && bikes != null ? Math.max(0, total - bikes) : null

  const operatingHours = String(raw.operatingHours ?? raw.hours ?? '')
  const status = String(raw.status ?? 'UNKNOWN').toUpperCase()

  return {
    stationId: String(stationId),
    stationName,
    address: address || '주소 정보 없음',
    lat,
    lng,
    totalSlots: total,
    availableBikes: bikes,
    emptySlots,
    operatingHours: operatingHours || '—',
    status
  }
}

/**
 * 대여소 상세 (GET /api/v1/stations/{stationId})
 *
 * @param {string} stationId
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<NonNullable<ReturnType<typeof mapStationDetail>>>}
 */
export async function fetchStationDetail(stationId, options = {}) {
  const id = String(stationId ?? '').trim()
  if (!id) {
    throw new Error('대여소 ID가 필요합니다.')
  }

  try {
    const res = await apiFetch(stationDetailPath(id), {
      signal: options.signal
    })

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
    assertStationsApiEnvelope(json)

    const raw = extractStationDetailResult(json)
    if (!raw) {
      throw new Error('대여소 정보를 찾을 수 없습니다.')
    }

    const mapped = mapStationDetail(raw)
    if (!mapped) {
      throw new Error('대여소 정보 형식이 올바르지 않습니다.')
    }
    return mapped
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[stations] detail → mock fallback', e)
    }
    const fallback = mockStationDetailById(id)
    if (!fallback) throw e
    return fallback
  }
}

/**
 * 주변 자전거 대여소 (GET /api/v1/stations/nearby)
 *
 * @param {object} params
 * @param {number} params.lat 현재 위치 위도
 * @param {number} params.lng 현재 위치 경도
 * @param {number} [params.radius] 검색 반경(m), 기본 1000, 최대 5000 (정수로 전송)
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<ReturnType<typeof mapStationRaw>[]>}
 */
export async function fetchNearbyStations(params) {
  const { lat, lng, radius, signal: outerSignal } = params

  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) {
    throw new Error('위도·경도가 올바르지 않습니다.')
  }

  let radiusM =
    radius != null && radius !== ''
      ? Math.floor(Number(radius))
      : DEFAULT_RADIUS_M
  if (!Number.isFinite(radiusM) || radiusM < 1) {
    radiusM = DEFAULT_RADIUS_M
  }
  if (radiusM > MAX_RADIUS_M) {
    radiusM = MAX_RADIUS_M
  }

  const q = new URLSearchParams()
  q.set('lat', String(la))
  q.set('lng', String(ln))
  q.set('radius', String(radiusM))

  try {
    const res = await apiFetch(`${NEARBY_PATH}?${q.toString()}`, {
      signal: outerSignal
    })

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
    assertStationsApiEnvelope(json)

    const list = extractStationList(json)
    return list.map((row) => mapStationRaw(row, la, ln)).filter(Boolean)
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[stations] nearby → mock fallback', e)
    }
    return mockNearbyMapped(la, ln)
  }
}
