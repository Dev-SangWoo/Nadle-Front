<template>
  <div class="flex flex-col h-full">
    <!-- 지도 영역 (상단) -->
    <div class="flex-1 min-h-0 relative">
      <KakaoMap
        ref="mapRef"
        :markers="stationMarkers"
        :selected-id="selectedStation?.id ?? null"
        @marker-click="onMarkerClick"
      />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import KakaoMap from '@/components/map/KakaoMap.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const rideStore = useRideStore()

const selectedStation = ref(null)

// TODO: 실제 공공 자전거 API 연동
const stations = ref([
  { id: 1, name: '광화문역 1번 출구', available: 8, distance: 120, lat: 37.5716, lng: 126.9768 },
  { id: 2, name: '경복궁 서측', available: 3, distance: 250, lat: 37.5779, lng: 126.9750 },
  { id: 3, name: '세종문화회관 앞', available: 12, distance: 310, lat: 37.5724, lng: 126.9760 }
])

const stationMarkers = computed(() =>
  stations.value.map(s => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    label: '🚲'
  }))
)

function onStationSelect(station) {
  selectedStation.value =
    selectedStation.value?.id === station.id ? null : station
}

function onMarkerClick(marker) {
  const station = stations.value.find(s => s.id === marker.id)
  if (station) onStationSelect(station)
}

function onConfirm() {
  rideStore.setStation(selectedStation.value)
  router.push('/map/riding')
}
</script>
