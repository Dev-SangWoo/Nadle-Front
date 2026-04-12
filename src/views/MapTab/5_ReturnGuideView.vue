<template>
  <div class="flex flex-col h-full min-h-0 bg-gray-100">
    <!-- 지도: 고정 비율로 두고 아래 목록에 충분한 높이 확보 -->
    <div
      class="relative flex-[0_0_34%] min-h-[156px] max-h-[38vh] shrink-0"
    >
      <KakaoMap
        ref="mapRef"
        :markers="returnMarkers"
        :selected-id="selectedReturn?.id ?? null"
        @marker-click="onMarkerClick"
      />
      <div class="absolute top-3 left-3 right-3 pointer-events-none">
        <div
          class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-md px-3.5 py-2.5 flex items-center gap-2 pointer-events-auto"
        >
          <span class="text-lg shrink-0" aria-hidden="true">🎉</span>
          <p class="text-sm font-semibold text-gray-800 leading-snug">
            미션 완료! 반납할 대여소를 골라주세요
          </p>
        </div>
      </div>
    </div>

    <!-- 하단 패널: 남는 높이 전부 사용 + 본문 단일 스크롤 -->
    <div
      class="flex-1 min-h-0 flex flex-col bg-white rounded-t-[1.35rem] shadow-[0_-8px_30px_rgba(0,0,0,.08)] -mt-3 z-10"
    >
      <div class="flex-shrink-0 pt-3 pb-1 flex justify-center">
        <div class="w-10 h-1 bg-gray-200 rounded-full" aria-hidden="true" />
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pt-1 pb-4">
        <h2 class="text-lg font-bold text-gray-900 mb-1">근처 반납 대여소</h2>
        <p class="text-[13px] text-gray-500 leading-relaxed mb-5">
          거리(m) 기준 가까운 4곳 중, 거치된 자전거가 가장 적은 곳이
          <span class="font-semibold text-orange-600">주황 마커(착한 대여소)</span>예요.
          아래에서 골라도 됩니다.
        </p>

        <!-- 착한 대여소 1곳 -->
        <template v-if="recommendedKindStation">
          <p class="text-[11px] font-bold text-orange-600 tracking-wide mb-2">
            반납 추천
          </p>
          <button
            type="button"
            @click="selectedReturn = recommendedKindStation"
            class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all text-left mb-6 active:scale-[0.99]"
            :class="selectedReturn?.id === recommendedKindStation.id
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
                대여 {{ recommendedKindStation.availableBikes }}대 · 빈자리 {{ recommendedKindStation.empty }} ·
                도보 {{ recommendedKindStation.distance }}m
              </p>
            </div>
            <span
              v-if="selectedReturn?.id === recommendedKindStation.id"
              class="text-orange-600 text-xl font-bold shrink-0"
            >✓</span>
          </button>
        </template>

        <!-- 다른 대여소: 섹션을 명확히, 행 높이·간격 확대 -->
        <template v-if="otherStations.length">
          <div class="flex items-end justify-between gap-2 mb-3">
            <div>
              <p class="text-sm font-bold text-gray-800">다른 근처 대여소</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ otherStations.length }}곳</p>
            </div>
          </div>
          <ul class="flex flex-col gap-2.5 pb-1" role="list">
            <li v-for="station in otherStations" :key="station.id">
              <button
                type="button"
                @click="selectedReturn = station"
                class="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] min-h-[4.25rem]"
                :class="selectedReturn?.id === station.id
                  ? 'border-nadle-green bg-nadle-light ring-2 ring-nadle-green/25'
                  : 'border-gray-100 bg-gray-50 hover:bg-gray-100/80'"
              >
                <span class="text-2xl shrink-0 w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center" aria-hidden="true">
                  🚲
                </span>
                <div class="flex-1 min-w-0 py-0.5">
                  <p class="text-[15px] font-semibold text-gray-900 leading-snug">
                    {{ station.name }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    대여 {{ station.availableBikes }}대 · 빈자리 {{ station.empty }} · {{ station.distance }}m
                  </p>
                </div>
                <span
                  v-if="selectedReturn?.id === station.id"
                  class="text-nadle-green text-xl font-bold shrink-0"
                >✓</span>
              </button>
            </li>
          </ul>
        </template>
      </div>

      <div class="flex-shrink-0 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
        <BaseButton class="w-full" @click="onReturnComplete">
          반납 완료 ✅
        </BaseButton>
      </div>
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

const selectedReturn = ref(null)

const anchor = computed(() => {
  const list = rideStore.destinations
  if (!list.length) {
    return { lat: 37.5665, lng: 126.978 }
  }
  const last = list[list.length - 1]
  return { lat: last.lat, lng: last.lng }
})

// TODO: GET 근처 반납 대여소 API — distance(m) 포함, 순서 무관. 프론트에서 가까운 4곳만 사용.
// 그중 거치 대수(availableBikes) 최소 = 착한 대여소. 동점이면 distance 짧은 곳.
const returnStations = computed(() => {
  const { lat: baseLat, lng: baseLng } = anchor.value
  const raw = [
    {
      id: 3,
      name: '청계천 광통교',
      empty: 10,
      distance: 320,
      availableBikes: 2,
      dLat: 0.00045,
      dLng: -0.00065
    },
    {
      id: 1,
      name: '인사동 골목 앞',
      empty: 14,
      distance: 85,
      availableBikes: 1,
      dLat: 0.0009,
      dLng: 0.00035
    },
    {
      id: 5,
      name: '남산 케이블카 입구',
      empty: 20,
      distance: 920,
      availableBikes: 4,
      dLat: -0.002,
      dLng: 0.0015
    },
    {
      id: 2,
      name: '종각역 2번 출구',
      empty: 3,
      distance: 210,
      availableBikes: 11,
      dLat: -0.00075,
      dLng: 0.0011
    },
    {
      id: 4,
      name: '광화문 광장 북측',
      empty: 8,
      distance: 400,
      availableBikes: 0,
      dLat: 0.0012,
      dLng: 0.0002
    },
    {
      id: 6,
      name: '시청역 부근',
      empty: 6,
      distance: 1050,
      availableBikes: 8,
      dLat: -0.0015,
      dLng: -0.0008
    }
  ]

  const mapped = raw.map((s) => {
    const lat = baseLat + s.dLat
    const lng = baseLng + s.dLng
    return {
      id: s.id,
      name: s.name,
      empty: s.empty,
      distance: s.distance,
      availableBikes: s.availableBikes,
      lat,
      lng
    }
  })

  const nearest = nearestStationsByDistance(mapped)

  const minBikes = Math.min(...nearest.map((s) => Number(s.availableBikes) || 0))
  const tier = nearest.filter((s) => (Number(s.availableBikes) || 0) === minBikes)
  const picked =
    tier.length === 0
      ? null
      : tier.reduce((best, s) => {
          if (!best) return s
          return s.distance < best.distance ? s : best
        })

  const kindId = picked?.id ?? null
  return nearest.map((s) => ({
    ...s,
    kindStation: s.id === kindId
  }))
})

const recommendedKindStation = computed(() =>
  returnStations.value.find((s) => s.kindStation) ?? null
)

const otherStations = computed(() =>
  returnStations.value.filter((s) => !s.kindStation)
)

const returnMarkers = computed(() =>
  returnStations.value.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    kindStation: s.kindStation,
    label: '🚲'
  }))
)

function onMarkerClick(marker) {
  const station = returnStations.value.find((s) => s.id === marker.id)
  if (station) selectedReturn.value = station
}

function onReturnComplete() {
  router.push('/map/result')
}
</script>
