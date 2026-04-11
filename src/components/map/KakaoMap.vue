<template>
  <div ref="mapContainer" class="w-full h-full bg-gray-100" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useLocationStore } from '@/stores/useLocationStore'

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: 37.5665, lng: 126.9780 })
  },
  level: { type: Number, default: 4 },
  markers: { type: Array, default: () => [] },
  selectedId: { type: [String, Number], default: null },
  /** 스토어에 위치가 있으면 파란 점으로 표시 */
  showUserLocation: { type: Boolean, default: true }
})

const locationStore = useLocationStore()

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
    @keyframes marker-kind-pulse {
      0%, 100% { box-shadow: 0 0 0 3px rgba(234,88,12,.45), 0 2px 8px rgba(0,0,0,.35); }
      50% { box-shadow: 0 0 0 6px rgba(234,88,12,.25), 0 2px 8px rgba(0,0,0,.35); }
    }
    .kakao-marker-kind {
      background: linear-gradient(145deg, #F97316, #EA580C) !important;
      width: 32px !important;
      height: 32px !important;
      font-size: 17px !important;
      line-height: 1 !important;
    }
    .kakao-marker-kind:not(.kakao-marker-glow) {
      animation: marker-kind-pulse 2s ease-in-out infinite;
    }
    @keyframes marker-glow-kind {
      0%, 100% { box-shadow: 0 0 6px 3px rgba(234,88,12,.5), 0 2px 6px rgba(0,0,0,.35); }
      50% { box-shadow: 0 0 14px 7px rgba(249,115,22,.55), 0 2px 6px rgba(0,0,0,.35); }
    }
    .kakao-marker-kind.kakao-marker-glow {
      animation: marker-glow-kind 1.5s ease-in-out infinite;
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

/** 마커 전용 오버레이와 분리 (내 위치는 유지) */
let userLocationOverlay = null
let userLocationEl = null

function removeUserLocationOverlay() {
  if (userLocationOverlay) {
    userLocationOverlay.setMap(null)
    userLocationOverlay = null
  }
  userLocationEl = null
}

function userLatLng() {
  if (
    !props.showUserLocation ||
    locationStore.lat == null ||
    locationStore.lng == null
  ) {
    return null
  }
  const { kakao } = window
  return new kakao.maps.LatLng(locationStore.lat, locationStore.lng)
}

function updateUserLocationOverlay() {
  if (!map.value) return
  const pos = userLatLng()
  if (!pos) {
    removeUserLocationOverlay()
    return
  }

  if (!userLocationEl) {
    userLocationEl = document.createElement('div')
    userLocationEl.style.cssText =
      'width:14px;height:14px;border-radius:50%;' +
      'background:#3B82F6;border:3px solid #fff;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.35);' +
      'transform:translate(-50%,-50%);'
  }

  if (!userLocationOverlay) {
    userLocationOverlay = new window.kakao.maps.CustomOverlay({
      position: pos,
      content: userLocationEl,
      yAnchor: 0.5,
      xAnchor: 0.5
    })
    userLocationOverlay.setMap(map.value)
  } else {
    userLocationOverlay.setPosition(pos)
  }
}

function renderMarkers() {
  if (!map.value) return
  const { kakao } = window

  clearOverlays()
  injectGlowStyle()

  const userPos = userLatLng()

  if (props.markers.length > 0) {
    const bounds = new kakao.maps.LatLngBounds()

    props.markers.forEach((marker) => {
      const { lat, lng, label, id, kindStation } = marker
      const position = new kakao.maps.LatLng(lat, lng)
      bounds.extend(position)

      const el = document.createElement('div')
      const isKind = kindStation === true
      el.style.cssText =
        'width:32px;height:32px;border-radius:50%;' +
        (isKind
          ? ''
          : 'background:#22C55E;color:#fff;font-weight:700;font-size:15px;') +
        'display:flex;align-items:center;justify-content:center;' +
        'box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff;' +
        'transform:translate(-50%,-50%);cursor:pointer;' +
        'transition:transform .2s ease;'
      if (isKind) el.classList.add('kakao-marker-kind')
      if (label != null && label !== '') {
        el.textContent = label
      } else if (!isKind) {
        el.textContent = '반'
      } else {
        el.textContent = '🚲'
      }

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
        xAnchor: 0.5,
        zIndex: isKind ? 3 : 2
      })
      overlay.setMap(map.value)
      overlays.value.push(overlay)
    })

    if (userPos) bounds.extend(userPos)
    map.value.setBounds(bounds, 30, 30, 30, 30)
  } else {
    const center = userPos ?? new kakao.maps.LatLng(props.center.lat, props.center.lng)
    map.value.setCenter(center)
  }

  updateUserLocationOverlay()
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

watch(() => props.showUserLocation, () => {
  nextTick(renderMarkers)
})

watch(
  () => [locationStore.lat, locationStore.lng],
  () => {
    nextTick(renderMarkers)
  }
)

watch(() => props.selectedId, updateSelection)

function initialCenterLatLng() {
  const { kakao } = window
  if (
    props.showUserLocation &&
    locationStore.lat != null &&
    locationStore.lng != null
  ) {
    return new kakao.maps.LatLng(locationStore.lat, locationStore.lng)
  }
  return new kakao.maps.LatLng(props.center.lat, props.center.lng)
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
      center: initialCenterLatLng(),
      level: props.level
    }
    map.value = new kakao.maps.Map(mapContainer.value, options)
    emit('mapReady')
    nextTick(renderMarkers)
  })
})

onUnmounted(() => {
  removeUserLocationOverlay()
})

defineExpose({ mapContainer, map })
</script>
