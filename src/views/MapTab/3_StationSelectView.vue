<template>
  <div class="flex flex-col h-full">
    <!-- 지도 영역 (상단) -->
    <div class="flex-1 min-h-0 relative">
      <KakaoMap ref="mapRef" />
    </div>

    <!-- 하단 대여소 리스트 패널 -->
    <div class="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-6 max-h-[45%] flex flex-col">
      <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 flex-shrink-0" />
      <p class="text-sm text-gray-400 mb-1 flex-shrink-0">현재 위치 주변 대여소</p>
      <p class="text-base font-bold text-gray-800 mb-3 flex-shrink-0">출발할 대여소를 선택하세요</p>

      <!-- 대여소 리스트 -->
      <div class="flex flex-col gap-2 overflow-y-auto flex-1">
        <button
          v-for="station in stations"
          :key="station.id"
          @click="onStationSelect(station)"
          class="flex items-center gap-3 p-3 rounded-xl border transition-colors text-left"
          :class="selectedStation?.id === station.id
            ? 'border-nadle-green bg-nadle-light'
            : 'border-gray-100 bg-gray-50'"
        >
          <span class="text-2xl">🚲</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ station.name }}</p>
            <p class="text-xs text-gray-400">잔여 {{ station.available }}대 · {{ station.distance }}m</p>
          </div>
          <span v-if="selectedStation?.id === station.id" class="text-nadle-green text-lg">✓</span>
        </button>
      </div>

      <BaseButton
        class="mt-4 flex-shrink-0"
        :disabled="!selectedStation"
        @click="onConfirm"
      >
        이 대여소에서 출발 🚀
      </BaseButton>
    </div>

    <!-- 대여소 상세 BottomSheet -->
    <BottomSheet v-if="showDetail" @close="showDetail = false">
      <div class="text-center py-2">
        <p class="text-2xl mb-2">🚲</p>
        <p class="text-lg font-bold text-gray-800">{{ selectedStation?.name }}</p>
        <p class="text-sm text-gray-400 mt-1">잔여 자전거: {{ selectedStation?.available }}대</p>
        <p class="text-sm text-gray-400">거리: {{ selectedStation?.distance }}m</p>
        <BaseButton class="mt-5 w-full" @click="onConfirm">여기서 출발</BaseButton>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import KakaoMap from '@/components/map/KakaoMap.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'

const router = useRouter()
const rideStore = useRideStore()

const selectedStation = ref(null)
const showDetail = ref(false)

// TODO: 실제 공공 자전거 API 연동
const stations = ref([
  { id: 1, name: '광화문역 1번 출구', available: 8, distance: 120 },
  { id: 2, name: '경복궁 서측', available: 3, distance: 250 },
  { id: 3, name: '세종문화회관 앞', available: 12, distance: 310 }
])

function onStationSelect(station) {
  selectedStation.value = station
  showDetail.value = true
}

function onConfirm() {
  rideStore.setStation(selectedStation.value)
  router.push('/map/riding')
}
</script>
