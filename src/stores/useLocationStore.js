import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLocationStore = defineStore('location', () => {
  const lat = ref(null)
  const lng = ref(null)
  const error = ref(null)
  /** idle | loading | ok | denied | unavailable | error */
  const status = ref('idle')

  let requested = false

  function requestOnce() {
    if (requested) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      status.value = 'unavailable'
      error.value = '이 환경에서는 위치 정보를 사용할 수 없습니다.'
      requested = true
      return
    }

    requested = true
    status.value = 'loading'
    error.value = null

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat.value = pos.coords.latitude
        lng.value = pos.coords.longitude
        status.value = 'ok'
        error.value = null
      },
      (err) => {
        if (err.code === 1 /* PERMISSION_DENIED */) {
          status.value = 'denied'
          error.value = '위치 권한이 거부되었습니다.'
        } else {
          status.value = 'error'
          error.value = err.message || '위치를 가져오지 못했습니다.'
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    )
  }

  /**
   * 주변 API 등에서 쓰기 위해 좌표가 생길 때까지 대기 (앱 진입 직후 GPS 지연 보정)
   * @param {number} [maxWaitMs=18000]
   * @returns {Promise<{ lat: number, lng: number } | null>} 실패·거부·타임아웃 시 null
   */
  function waitForCoords(maxWaitMs = 18000) {
    if (status.value === 'idle') {
      requestOnce()
    }
    if (lat.value != null && lng.value != null) {
      return Promise.resolve({ lat: lat.value, lng: lng.value })
    }
    if (['denied', 'unavailable', 'error'].includes(status.value)) {
      return Promise.resolve(null)
    }
    return new Promise((resolve) => {
      const start = Date.now()
      const tick = setInterval(() => {
        if (lat.value != null && lng.value != null) {
          clearInterval(tick)
          resolve({ lat: lat.value, lng: lng.value })
          return
        }
        if (['denied', 'unavailable', 'error'].includes(status.value)) {
          clearInterval(tick)
          resolve(null)
          return
        }
        if (Date.now() - start >= maxWaitMs) {
          clearInterval(tick)
          resolve(null)
        }
      }, 80)
    })
  }

  return { lat, lng, error, status, requestOnce, waitForCoords }
})
