// 개발 환경: Vite 프록시(/api)로 CORS 우회 / 프로덕션: 직접 호출
const BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL

const RESTAURANT_MID = ['한식', '중식', '일식', '서양식', '동남아시아']

function resolveCategoryMeta(indsMclsCdNm, indsSclsCdNm) {
  const mid = indsMclsCdNm ?? ''
  const sub = indsSclsCdNm ?? ''

  if (sub === '카페') return { category: 'cafe', emoji: '☕', useSubLabel: false }
  if (RESTAURANT_MID.some(k => mid === k)) return { category: 'restaurant', emoji: '🍽️', useSubLabel: false }
  if (mid === '주점') return { category: 'bar', emoji: '🍺', useSubLabel: false }
  return { category: 'restaurant', emoji: '🍽️', useSubLabel: true }
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
    .map((item) => {
      const { category, emoji, useSubLabel } = resolveCategoryMeta(item.indsMclsCdNm, item.indsSclsCdNm)
      return {
        id:          item.bizesId,
        name:        item.bizesNm,
        category,
        emoji,
        useSubLabel,
        address:     item.rdnWhlAddr,
        lat:         item.lat,
        lng:         item.lon,
        midCategory: item.indsMclsCdNm ?? '',
        subCategory: item.indsSclsCdNm ?? '',
      }
    })
}
