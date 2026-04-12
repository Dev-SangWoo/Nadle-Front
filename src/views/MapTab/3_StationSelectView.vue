<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- 지도 영역 (상단) -->
    <div class="flex-1 min-h-0 relative">
      <KakaoMap
        ref="mapRef"
        :markers="stationMarkers"
        :selected-id="selectedStation?.id ?? null"
        @marker-click="onMarkerClick"
      />
      <div class="absolute top-3 left-3 right-3 pointer-events-none">
        <div
          class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md px-3.5 py-2.5 flex items-center gap-2 pointer-events-auto"
        >
          <span class="text-lg shrink-0" aria-hidden="true">🚲</span>
          <p class="text-sm font-semibold text-gray-800 leading-snug">
            거리(m) 기준 가까운 4곳 중, 잔여가 가장 많은 곳이
            <span class="font-semibold text-orange-600">주황 마커</span>
            <span class="text-orange-700">(착한 대여소)</span>예요.
          </p>
        </div>
      </div>
    </div>

    <!-- 하단 대여소 리스트 패널 -->
    <div
      class="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-6 max-h-[48%] flex flex-col flex-shrink-0"
    >
      <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 flex-shrink-0" />
      <p class="text-sm text-gray-400 mb-1 flex-shrink-0">현재 위치 주변 대여소</p>
      <p class="text-base font-bold text-gray-800 mb-3 flex-shrink-0">출발할 대여소를 선택하세요</p>

      <div class="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
        <!-- 착한 대여소: 대여(출발) — 잔여 대수 최다 추천 (반납 화면과 반대 기준) -->
        <template v-if="recommendedKindStation">
          <p class="text-[11px] font-bold text-orange-600 tracking-wide mb-2 flex-shrink-0">
            출발 추천
          </p>
          <button
            type="button"
            @click="onStationSelect(recommendedKindStation)"
            class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all text-left mb-4 flex-shrink-0 active:scale-[0.99]"
            :class="selectedStation?.id === recommendedKindStation.id
              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200/60'
              : 'border-orange-200 bg-gradient-to-br from-orange-50/90 to-amber-50/50'"
          >
            <span
              class="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-md ring-2 ring-white flex items-center justify-center text-xl"
              aria-hidden="true"
            >
              🚲
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-orange-700 mb-0.5">착한 대여소</p>
              <p class="text-[15px] font-semibold text-gray-900 leading-tight">
                {{ recommendedKindStation.name }}
              </p>
              <p class="text-xs text-gray-600 mt-1">
                잔여 {{ recommendedKindStation.available }}대 · {{ recommendedKindStation.distance }}m
              </p>
              <p class="text-[11px] text-orange-800/80 mt-1.5 leading-snug">
                이 근처에서 대여하기 좋아요
              </p>
            </div>
            <span
              v-if="selectedStation?.id === recommendedKindStation.id"
              class="text-orange-600 text-xl font-bold shrink-0"
            >✓</span>
          </button>
        </template>

        <template v-if="otherStations.length">
          <div class="flex items-end justify-between gap-2 mb-2 flex-shrink-0">
            <div>
              <p class="text-sm font-bold text-gray-800">다른 근처 대여소</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ otherStations.length }}곳</p>
            </div>
          </div>
          <ul class="flex flex-col gap-2.5 pb-1" role="list">
            <li v-for="station in otherStations" :key="station.id">
              <button
                type="button"
                @click="onStationSelect(station)"
                class="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.99] min-h-[4rem]"
                :class="selectedStation?.id === station.id
                  ? 'border-nadle-green bg-nadle-light ring-2 ring-nadle-green/25'
                  : 'border-gray-100 bg-gray-50'"
              >
                <span
                  class="text-2xl shrink-0 w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center"
                  aria-hidden="true"
                >
                  🚲
                </span>
                <div class="flex-1 min-w-0 py-0.5">
                  <p class="text-[15px] font-semibold text-gray-900 leading-snug">
                    {{ station.name }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    잔여 {{ station.available }}대 · {{ station.distance }}m
                  </p>
                </div>
                <span
                  v-if="selectedStation?.id === station.id"
                  class="text-nadle-green text-xl font-bold shrink-0"
                >✓</span>
              </button>
            </li>
          </ul>
        </template>
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
import { nearestStationsByDistance } from '@/utils/stationSelection'

const router = useRouter()
const rideStore = useRideStore()

const selectedStation = ref(null)

// TODO: GET 근처 대여소 API — distance(m) 포함, 순서 무관. 프론트에서 가까운 4곳만 사용.
const stationsRaw = ref([
  { id: 3, name: '세종문화회관 앞', available: 12, distance: 310, lat: 37.5724, lng: 126.9760 },
  { id: 1, name: '광화문역 1번 출구', available: 8, distance: 120, lat: 37.5716, lng: 126.9768 },
  { id: 5, name: '덕수궁 돌담길', available: 15, distance: 890, lat: 37.5658, lng: 126.9751 },
  { id: 2, name: '경복궁 서측', available: 3, distance: 250, lat: 37.5779, lng: 126.9750 },
  { id: 4, name: '광화문 광장 서편', available: 5, distance: 195, lat: 37.5728, lng: 126.9774 },
  { id: 6, name: '서소문', available: 6, distance: 1120, lat: 37.5633, lng: 126.968 }
])

/**
 * 1) distance 오름차순 → 가까운 4곳
 * 2) 그중 잔여(available) 최다 = 착한 대여소 (동점이면 distance 짧은 곳)
 */
const stations = computed(() => {
  const list = nearestStationsByDistance(stationsRaw.value)
  if (!list.length) return []

  const maxAvail = Math.max(...list.map((s) => Number(s.available) || 0))
  const tier = list.filter((s) => (Number(s.available) || 0) === maxAvail)
  const picked =
    tier.length === 0
      ? null
      : tier.reduce((best, s) => {
          if (!best) return s
          return s.distance < best.distance ? s : best
        })

  const kindId = picked?.id ?? null
  return list.map((s) => ({
    ...s,
    kindStation: s.id === kindId
  }))
})

const recommendedKindStation = computed(
  () => stations.value.find((s) => s.kindStation) ?? null
)

const otherStations = computed(() =>
  stations.value.filter((s) => !s.kindStation)
)

const stationMarkers = computed(() =>
  stations.value.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    kindStation: s.kindStation === true,
    label: '🚲'
  }))
)

function onStationSelect(station) {
  selectedStation.value =
    selectedStation.value?.id === station.id ? null : station
}

function onMarkerClick(marker) {
  const station = stations.value.find((s) => s.id === marker.id)
  if (station) onStationSelect(station)
}

function onConfirm() {
  rideStore.setStation(selectedStation.value)
  router.push('/map/riding')
}
</script>
