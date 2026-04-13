<template>
  <div class="flex flex-col h-full min-h-0 bg-gray-100">
    <!-- 지도: 고정 비율로 두고 아래 목록에 충분한 높이 확보 -->
    <div
      class="relative isolate flex-[0_0_34%] min-h-[156px] max-h-[38vh] shrink-0"
    >
      <KakaoMap
        ref="mapRef"
        class="relative z-0"
        :markers="returnMarkers"
        :selected-id="selectedReturn?.id ?? null"
        @marker-click="onMarkerClick"
      />
      <div class="absolute top-3 left-3 right-3 z-10 pointer-events-none">
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

        <p v-if="loadStatus === 'loading'" class="text-sm text-gray-500 py-6 text-center">
          주변 반납 대여소를 불러오는 중…
        </p>
        <p v-else-if="loadStatus === 'error'" class="text-sm text-red-600 py-4 text-center leading-relaxed">
          대여소를 불러오지 못했어요.
          <button
            type="button"
            class="mt-2 block mx-auto text-nadle-green font-semibold underline"
            @click="loadReturnStations"
          >
            다시 시도
          </button>
        </p>
        <p v-else-if="loadStatus === 'empty'" class="text-sm text-gray-500 py-6 text-center">
          주변에 표시할 대여소가 없어요. 잠시 후 다시 시도해 주세요.
        </p>

        <!-- 착한 대여소 1곳 -->
        <template v-if="loadStatus === 'ok' && recommendedKindStation">
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
        <template v-if="loadStatus === 'ok' && otherStations.length">
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

        <button
          v-if="loadStatus === 'ok' && selectedReturn"
          type="button"
          class="mt-4 text-sm font-semibold text-nadle-green underline text-left"
          @click="detailSheetOpen = true"
        >
          선택한 대여소 상세 정보
        </button>
      </div>

      <div class="flex-shrink-0 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
        <BaseButton
          class="w-full"
          :disabled="!selectedReturn"
          @click="onReturnComplete"
        >
          반납 완료 ✅
        </BaseButton>
      </div>
    </div>
  </div>

  <StationDetailSheet
    :open="detailSheetOpen"
    :station-id="selectedReturn?.id != null ? String(selectedReturn.id) : ''"
    @close="detailSheetOpen = false"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import { fetchNearbyStations } from '@/api/stations'
import KakaoMap from '@/components/map/KakaoMap.vue'
import StationDetailSheet from '@/components/map/StationDetailSheet.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { nearestStationsByDistance } from '@/utils/stationSelection'

const router = useRouter()
const rideStore = useRideStore()

const selectedReturn = ref(null)
const detailSheetOpen = ref(false)

const anchor = computed(() => {
  const list = rideStore.destinations
  if (!list.length) {
    return { lat: 37.5665, lng: 126.978 }
  }
  const last = list[list.length - 1]
  return { lat: last.lat, lng: last.lng }
})

const anchorKey = computed(
  () =>
    `${Number(anchor.value.lat).toFixed(6)},${Number(anchor.value.lng).toFixed(6)}`
)

/** GET /api/v1/stations/nearby 결과 (기준점 주변) */
const stationsFromApi = ref([])

/** idle | loading | ok | empty | error */
const loadStatus = ref('idle')

async function loadReturnStations() {
  loadStatus.value = 'loading'
  selectedReturn.value = null
  detailSheetOpen.value = false

  const la = Number(anchor.value.lat)
  const ln = Number(anchor.value.lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) {
    stationsFromApi.value = []
    loadStatus.value = 'error'
    return
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const list = await fetchNearbyStations({
      lat: la,
      lng: ln,
      signal: controller.signal
    })
    stationsFromApi.value = list
    loadStatus.value = list.length ? 'ok' : 'empty'
  } catch (e) {
    stationsFromApi.value = []
    loadStatus.value = 'error'
    if (import.meta.env.DEV) {
      console.warn('[ReturnGuide] fetchNearbyStations:', e)
    }
  } finally {
    clearTimeout(timer)
  }
}

watch(anchorKey, () => {
  loadReturnStations()
}, { immediate: true })

/**
 * distance 기준 가까운 4곳만 사용.
 * 그중 거치 대수(availableBikes) 최소 = 착한 대여소. 동점이면 distance 짧은 곳.
 */
const returnStations = computed(() => {
  const mapped = stationsFromApi.value.map((s) => ({
    id: s.id,
    name: s.name,
    empty: s.emptyCount,
    distance: s.distance,
    availableBikes: s.bikeCount,
    lat: s.lat,
    lng: s.lng
  }))
  if (!mapped.length) return []

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
  try {
    const isKind =
      selectedReturn.value != null &&
      recommendedKindStation.value != null &&
      selectedReturn.value.id === recommendedKindStation.value.id
    rideStore.setKindStation(isKind)
  } catch (e) {
    console.warn('[ReturnGuide] setKindStation error:', e)
  }
  router.push('/map/result')
}
</script>
