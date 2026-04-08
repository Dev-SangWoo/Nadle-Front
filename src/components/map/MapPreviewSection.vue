<template>
  <div class="relative w-full h-full">
    <!-- 지도 도화지 -->
    <KakaoMap ref="mapRef" />

    <!-- 카카오맵 앱 딥링크 버튼 -->
    <button
      @click="openKakaoMap"
      class="absolute bottom-4 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-transform"
    >
      <span>🗺️</span> 카카오맵으로 열기
    </button>

    <!-- 현재 목적지 배지 (주행 중) -->
    <div v-if="showRoute && currentDestination" class="absolute top-4 left-4 right-4">
      <div class="bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-2">
        <span class="text-lg">📍</span>
        <div>
          <p class="text-xs text-gray-400">현재 목적지</p>
          <p class="text-sm font-bold text-gray-800">{{ currentDestination.spotName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import KakaoMap from './KakaoMap.vue'

const props = defineProps({
  destinations: { type: Array, default: () => [] },
  currentIndex: { type: Number, default: 0 },
  showRoute: { type: Boolean, default: false }
})

const currentDestination = computed(
  () => props.destinations[props.currentIndex] ?? null
)

function openKakaoMap() {
  if (!props.destinations.length) return
  const dest = props.destinations[props.currentIndex] ?? props.destinations[0]
  // TODO: 실제 좌표 연동
  const url = `kakaomap://look?p=${dest.lat ?? 37.5665},${dest.lng ?? 126.9780}`
  const webUrl = `https://map.kakao.com/link/to/${dest.spotName},${dest.lat ?? 37.5665},${dest.lng ?? 126.9780}`
  try {
    window.location.href = url
    setTimeout(() => { window.open(webUrl, '_blank') }, 1500)
  } catch {
    window.open(webUrl, '_blank')
  }
}
</script>
