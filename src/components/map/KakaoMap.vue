<template>
  <div ref="mapContainer" class="w-full h-full bg-gray-100" />
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: 37.5665, lng: 126.9780 })
  },
  level: { type: Number, default: 4 },
  markers: { type: Array, default: () => [] },
  selectedId: { type: [String, Number], default: null }
})

const emit = defineEmits(['mapReady', 'markerClick'])

const mapContainer = ref(null)
const map = ref(null)
const overlays = ref([])
const markerEls = ref(new Map())

let glowStyleInjected = false
function injectGlowStyle() {
  if (glowStyleInjected) return
  glowStyleInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes marker-glow {
      0%, 100% { box-shadow: 0 0 6px 3px rgba(34,197,94,.4), 0 2px 6px rgba(0,0,0,.35); }
      50% { box-shadow: 0 0 14px 7px rgba(34,197,94,.6), 0 2px 6px rgba(0,0,0,.35); }
    }
    .kakao-marker-glow {
      animation: marker-glow 1.5s ease-in-out infinite;
      transform: translate(-50%,-50%) scale(1.2);
    }
  `
  document.head.appendChild(style)
}

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

function clearOverlays() {
  overlays.value.forEach(o => o.setMap(null))
  overlays.value = []
  markerEls.value.clear()
}

function renderMarkers() {
  if (!map.value || !props.markers.length) return
  const { kakao } = window

  clearOverlays()
  injectGlowStyle()

  const bounds = new kakao.maps.LatLngBounds()

  props.markers.forEach((marker) => {
    const { lat, lng, label, id } = marker
    const position = new kakao.maps.LatLng(lat, lng)
    bounds.extend(position)

    const el = document.createElement('div')
    el.style.cssText =
      'width:32px;height:32px;border-radius:50%;' +
      'background:#22C55E;color:#fff;font-weight:700;font-size:14px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff;' +
      'transform:translate(-50%,-50%);cursor:pointer;' +
      'transition:transform .2s ease;'
    el.textContent = label

    if (id != null && id === props.selectedId) {
      el.classList.add('kakao-marker-glow')
    }

    if (id != null) {
      el.addEventListener('click', () => emit('markerClick', marker))
      markerEls.value.set(id, el)
    }

    const overlay = new kakao.maps.CustomOverlay({
      position,
      content: el,
      yAnchor: 0.5,
      xAnchor: 0.5
    })
    overlay.setMap(map.value)
    overlays.value.push(overlay)
  })

  map.value.setBounds(bounds, 30, 30, 30, 30)
}

function updateSelection() {
  markerEls.value.forEach((el, id) => {
    if (id === props.selectedId) {
      el.classList.add('kakao-marker-glow')
    } else {
      el.classList.remove('kakao-marker-glow')
    }
  })
}

watch(() => props.markers, () => {
  nextTick(renderMarkers)
}, { deep: true })

watch(() => props.selectedId, updateSelection)

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
    emit('mapReady')
    nextTick(renderMarkers)
  })
})

defineExpose({ mapContainer, map })
</script>
