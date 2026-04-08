<template>
  <div ref="mapContainer" class="w-full h-full bg-gray-100" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: 37.5665, lng: 126.9780 })
  },
  level: { type: Number, default: 4 }
})

const mapContainer = ref(null)
const map = ref(null)

let scriptLoadPromise = null

function loadKakaoSdk(appKey) {
  if (typeof window !== 'undefined' && window.kakao?.maps) {
    return Promise.resolve()
  }
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kakao-maps-sdk]')
    if (existing) {
      if (window.kakao?.maps) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('카카오맵 SDK 로드 실패')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.dataset.kakaoMapsSdk = 'true'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

onMounted(async () => {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY
  if (!appKey) {
    console.warn('[KakaoMap] .env에 VITE_KAKAO_MAP_APP_KEY를 설정하세요.')
    return
  }
  if (!mapContainer.value) return

  try {
    await loadKakaoSdk(appKey)
  } catch (e) {
    console.error('[KakaoMap]', e)
    return
  }

  window.kakao.maps.load(() => {
    const { kakao } = window
    const options = {
      center: new kakao.maps.LatLng(props.center.lat, props.center.lng),
      level: props.level
    }
    map.value = new kakao.maps.Map(mapContainer.value, options)
  })
})

defineExpose({ mapContainer, map })
</script>
