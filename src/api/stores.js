// 개발 환경: Vite 프록시(/api)로 CORS 우회 / 프로덕션: 직접 호출
const BASE_URL = import.meta.env.DEV ? '' : 'https://nadle-backend.onrender.com'

/**
 * indsMclsCdNm(중분류명) → { category, emoji } 매핑
 */
const CATEGORY_MAP = {
  '음식점':   { category: 'restaurant', emoji: '🍽️' },
  '카페':     { category: 'cafe',       emoji: '☕' },
  '제과점':   { category: 'bakery',     emoji: '🥐' },
  '베이커리':  { category: 'bakery',     emoji: '🥐' },
  '주점':     { category: 'bar',        emoji: '🍺' },
  '바':       { category: 'bar',        emoji: '🍺' },
  '쇼핑':     { category: 'shopping',   emoji: '🛍️' },
  '편의점':   { category: 'shopping',   emoji: '🏪' },
  '슈퍼마켓': { category: 'shopping',   emoji: '🛒' },
}

function resolveCategoryMeta(indsMclsCdNm, indsSclsCdNm) {
  const mid = indsMclsCdNm ?? ''
  const sub = indsSclsCdNm ?? ''
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (mid.includes(key) || sub.includes(key)) {
      return CATEGORY_MAP[key]
    }
  }
  return { category: 'attraction', emoji: '🏪' }
}

/**
 * 주변 상권 목록 조회
 * @param {number} lat  위도
 * @param {number} lng  경도
 * @param {number} [radius=1000]  검색 반경(m)
 * @returns {Promise<Array>}
 */
export async function fetchNearbyStores(lat, lng, radius = 1000) {
  const params = new URLSearchParams({ lat, lng, radius })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  let res
  try {
    res = await fetch(`${BASE_URL}/api/v1/stores/nearby?${params}`, {
      signal: controller.signal
    })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('요청 시간이 초과됐어요 (서버 준비 중일 수 있어요)')
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    throw new Error(`상권 API 오류: ${res.status}`)
  }

  const json = await res.json()

  if (json.code !== 200) {
    throw new Error(json.message ?? '상권 조회 실패')
  }

  return (json.result ?? [])
    .filter((item) => item.indsSclsCdNm === '카페')
    .map((item) => {
      const { category, emoji } = resolveCategoryMeta(item.indsMclsCdNm, item.indsSclsCdNm)
      return {
        id:          item.bizesId,
        name:        item.bizesNm,
        category,
        emoji,
        address:     item.rdnWhlAddr,
        lat:         item.lat,
        lng:         item.lon,
        subCategory: item.indsSclsCdNm ?? '',
      }
    })
}
