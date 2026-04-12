/** API가 주변 대여소를 줄 때 distance(m)만 쓰면, 프론트에서 가까운 순으로 잘라 쓴다. */
export const NEAREST_STATION_COUNT = 4

/**
 * @param {Array<{ distance?: number }>} stations
 * @param {number} [n=NEAREST_STATION_COUNT]
 * @returns {typeof stations}
 */
export function nearestStationsByDistance(stations, n = NEAREST_STATION_COUNT) {
  if (!stations?.length) return []
  const dist = (s) => {
    const d = Number(s?.distance)
    return Number.isFinite(d) ? d : Number.POSITIVE_INFINITY
  }
  return [...stations].sort((a, b) => dist(a) - dist(b)).slice(0, n)
}
