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
        if (err.code === err.PERMISSION_DENIED) {
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

  return { lat, lng, error, status, requestOnce }
})
