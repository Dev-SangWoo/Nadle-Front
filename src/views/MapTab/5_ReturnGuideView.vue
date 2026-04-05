<template>
  <div class="flex flex-col h-full">
    <!-- 지도: 마지막 목적지 주변 반납 대여소 표시 -->
    <div class="flex-1 min-h-0 relative">
      <KakaoMap ref="mapRef" />
      <div class="absolute top-4 left-4 right-4">
        <div class="bg-white rounded-2xl shadow-md px-4 py-3 flex items-center gap-2">
          <span class="text-xl">🎉</span>
          <p class="text-sm font-semibold text-gray-800">모든 미션 완료! 자전거를 반납해주세요</p>
        </div>
      </div>
    </div>

    <!-- 하단: 반납 대여소 리스트 -->
    <div class="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-6 max-h-[45%] flex flex-col">
      <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 flex-shrink-0" />
      <p class="text-base font-bold text-gray-800 mb-3 flex-shrink-0">근처 반납 대여소</p>

      <div class="flex flex-col gap-2 overflow-y-auto flex-1">
        <button
          v-for="station in returnStations"
          :key="station.id"
          @click="selectedReturn = station"
          class="flex items-center gap-3 p-3 rounded-xl border transition-colors text-left"
          :class="selectedReturn?.id === station.id
            ? 'border-nadle-green bg-nadle-light'
            : 'border-gray-100 bg-gray-50'"
        >
          <span class="text-2xl">🚲</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ station.name }}</p>
            <p class="text-xs text-gray-400">빈 자리 {{ station.empty }}개 · {{ station.distance }}m</p>
          </div>
        </button>
      </div>

      <BaseButton class="mt-4 flex-shrink-0" @click="onReturnComplete">
        반납 완료 ✅
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import KakaoMap from '@/components/map/KakaoMap.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const selectedReturn = ref(null)

// TODO: 실제 API 연동
const returnStations = ref([
  { id: 1, name: '인사동 사거리', empty: 5, distance: 80 },
  { id: 2, name: '종각역 2번 출구', empty: 2, distance: 200 },
  { id: 3, name: '청계천 광통교', empty: 9, distance: 350 }
])

function onReturnComplete() {
  router.push('/map/result')
}
</script>
