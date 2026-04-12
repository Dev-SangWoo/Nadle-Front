<template>
  <div class="flex flex-col h-full bg-nadle-light overflow-y-auto">
    <!-- 헤더 -->
    <div class="flex flex-col items-center pt-10 pb-6 px-6 bg-white">
      <p class="text-4xl mb-2">🎉</p>
      <h1 class="text-2xl font-bold text-gray-800 mb-1">마실 완료!</h1>
      <p class="text-sm text-gray-500">오늘도 멋진 동네 여행이었어요</p>
    </div>

    <!-- 획득한 스탬프: 한 줄 가로 배치(작은 칸, 많으면 가로 스크롤) -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <p class="text-sm font-semibold text-gray-600 mb-2">획득한 스탬프</p>
      <div
        class="flex justify-center overflow-x-auto pb-1 -mx-0.5 px-0.5 [scrollbar-width:thin]"
      >
        <div
          class="inline-flex flex-nowrap items-start gap-2 sm:gap-2.5"
          role="list"
        >
        <div
          v-for="stamp in rideStore.stamps"
          :key="stamp.name"
          class="flex flex-col items-center flex-shrink-0 w-[3.25rem] sm:w-14 text-center"
          role="listitem"
        >
          <div class="h-7 sm:h-8 flex items-center justify-center">
            <span class="text-xl sm:text-2xl leading-none" aria-hidden="true">🏅</span>
          </div>
          <p class="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-2 break-words w-full">
            {{ stamp.name }}
          </p>
        </div>

        <!-- 출발·반납 착한 대여소: 초록 스탬프(🏅) 배지 -->
        <div
          v-for="bonus in kindStationBonusStamps"
          :key="bonus.id"
          class="flex flex-col items-center flex-shrink-0 w-[3.25rem] sm:w-14 text-center"
          role="listitem"
        >
          <div class="h-7 sm:h-8 flex items-center justify-center">
            <span
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-nadle-green to-green-600 flex items-center justify-center text-sm sm:text-base shadow-sm ring-1 ring-green-200/90"
              :aria-label="`${bonus.label} 스탬프`"
            >
              <span class="drop-shadow-sm brightness-110 contrast-95" aria-hidden="true">🏅</span>
            </span>
          </div>
          <p class="text-[9px] sm:text-[10px] font-semibold text-nadle-green mt-0.5 leading-tight line-clamp-2 break-words w-full">
            {{ bonus.label }}
          </p>
        </div>
        </div>
      </div>
    </div>

    <!-- 여행 요약 + 방문 코스(최대 3곳, 가로) -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <p class="text-sm font-semibold text-gray-600 mb-4">여행 요약</p>
      <div class="grid grid-cols-3 gap-2 sm:gap-3 text-center pb-4 border-b border-gray-100">
        <div class="rounded-xl bg-nadle-light/60 py-3 px-1">
          <p class="text-lg sm:text-xl font-bold text-nadle-green tabular-nums">{{ summary.distance }}</p>
          <p class="text-[11px] sm:text-xs text-gray-400 mt-0.5">총 거리</p>
        </div>
        <div class="rounded-xl bg-nadle-light/60 py-3 px-1">
          <p class="text-lg sm:text-xl font-bold text-nadle-green tabular-nums">{{ summary.time }}</p>
          <p class="text-[11px] sm:text-xs text-gray-400 mt-0.5">소요 시간</p>
        </div>
        <div class="rounded-xl bg-nadle-light/60 py-3 px-1 min-w-0">
          <p class="flex flex-wrap items-baseline justify-center gap-x-1 tabular-nums">
            <span class="text-lg sm:text-xl font-bold text-nadle-green leading-tight">{{ totalStampCount }}</span>
            <span class="text-[9px] sm:text-[10px] font-semibold text-gray-500 leading-tight tracking-tight">
              ({{ rideStore.stamps.length }}+{{ kindStationBonusStamps.length }})
            </span>
          </p>
          <p class="text-[11px] sm:text-xs text-gray-400 mt-0.5">스탬프</p>
        </div>
      </div>

      <template v-if="rideStore.destinations.length">
        <p class="text-xs font-semibold text-gray-500 mt-4 mb-2">방문 코스</p>
        <div
          ref="courseFitOuter"
          class="w-full min-w-0 overflow-hidden min-h-[1.25rem]"
        >
          <div class="flex justify-start w-full min-w-0">
            <div
              class="inline-block max-w-full text-left"
              :style="courseRouteMidStyle"
            >
            <div
              ref="courseFitInner"
              class="inline-flex items-center flex-nowrap gap-x-[0.35em] whitespace-nowrap font-semibold leading-tight text-gray-800"
              :style="{ fontSize: `${courseRouteFontPx}px` }"
            >
              <template v-for="(dest, idx) in rideStore.destinations" :key="idx">
                <span class="inline-flex items-center gap-[0.35em] shrink-0">
                  <span
                    class="w-[1.35em] h-[1.35em] rounded-full bg-nadle-green text-white flex items-center justify-center shadow-sm shrink-0 text-[0.68em] font-bold leading-none"
                  >
                    {{ idx + 1 }}
                  </span>
                  <span>{{ dest.spotName }}</span>
                </span>
                <span
                  v-if="idx < rideStore.destinations.length - 1"
                  class="text-gray-400 font-medium shrink-0 select-none"
                  aria-hidden="true"
                > -&gt; </span>
              </template>
            </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 결과 지도 -->
    <div class="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 relative" style="height: 240px;">
      <KakaoMap
        style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;"
        :markers="mapMarkers"
        :level="5"
        @marker-click="onMapMarkerClick"
      />
      <div class="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm text-xs text-gray-600">
        <span class="flex items-center gap-1">
          <span class="inline-block w-4 h-4 rounded-full bg-nadle-green border-2 border-white shadow-sm"></span>코스
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block w-3.5 h-3.5 rounded-full bg-blue-50 border-2 border-blue-200 shadow-sm"></span>주변상권
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></span>내 위치
        </span>
      </div>
    </div>

    <!-- 주변에 들릴만한 곳 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-semibold text-gray-600">주변에 들릴만한 곳</p>
        <!-- 카테고리 탭 -->
        <div v-if="!isLoadingPlaces && nearbyPlaces.length > 0" class="flex gap-1">
          <button
            v-for="tab in visibleTabs"
            :key="tab.id"
            class="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
            :class="selectedCategory === tab.id
              ? 'bg-nadle-green text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
            @click="selectedCategory = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-if="isLoadingPlaces" class="flex items-center justify-center py-6 gap-2">
        <span class="w-4 h-4 rounded-full border-2 border-nadle-green border-t-transparent animate-spin"></span>
        <span class="text-xs text-gray-400">주변 상권 불러오는 중…</span>
      </div>

      <!-- 에러 -->
      <div v-else-if="placesError" class="py-4 text-center">
        <p class="text-xs text-gray-400">{{ placesError }}</p>
      </div>

      <!-- 결과 없음 -->
      <div v-else-if="nearbyPlaces.length === 0" class="py-4 text-center">
        <p class="text-xs text-gray-400">반경 1km 내 상권 정보가 없어요</p>
      </div>

      <!-- 목록 -->
      <div v-else class="flex flex-col gap-3">
        <div v-if="sortedFilteredPlaces.length === 0" class="py-4 text-center">
          <p class="text-xs text-gray-400">해당 카테고리의 장소가 없어요</p>
        </div>
        <template v-else>
          <button
            v-for="place in pagedPlaces"
            :key="place.id"
            class="flex items-center gap-3 w-full text-left rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-all"
            @click="openPlaceDetail(place)"
          >
            <span class="text-3xl flex-shrink-0">{{ place.emoji }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <p class="text-sm font-bold text-gray-800 truncate">{{ place.name }}</p>
                <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  :class="categoryBadge(place.category)">
                  {{ categoryLabel(place) }}
                </span>
              </div>
              <p class="text-xs text-gray-400 truncate">{{ place.address }}</p>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0">
              <span class="text-xs font-semibold text-nadle-green tabular-nums whitespace-nowrap">
                {{ formatPlaceDistance(place) }}
              </span>
              <span class="text-gray-300 text-lg leading-none">›</span>
            </div>
          </button>
          <div
            v-if="nearbyPlacesPageCount > 1"
            class="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-100"
          >
            <button
              type="button"
              class="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 disabled:pointer-events-none"
              :class="nearbyPlacesPage <= 1
                ? 'border-gray-200 text-gray-400'
                : 'border-nadle-green text-nadle-green bg-green-50 active:bg-green-100'"
              :disabled="nearbyPlacesPage <= 1"
              @click="nearbyPlacesPage--"
            >
              이전
            </button>
            <span class="text-xs text-gray-500 tabular-nums min-w-[4.5rem] text-center">
              {{ nearbyPlacesPage }} / {{ nearbyPlacesPageCount }}
            </span>
            <button
              type="button"
              class="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 disabled:pointer-events-none"
              :class="nearbyPlacesPage >= nearbyPlacesPageCount
                ? 'border-gray-200 text-gray-400'
                : 'border-nadle-green text-nadle-green bg-green-50 active:bg-green-100'"
              :disabled="nearbyPlacesPage >= nearbyPlacesPageCount"
              @click="nearbyPlacesPage++"
            >
              다음
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 홈으로 버튼 -->
    <div class="px-4 mt-6 mb-8">
      <BaseButton @click="onGoHome">처음으로 돌아가기 🏠</BaseButton>
    </div>

    <!-- 주변 상권 상세 시트 -->
    <NearbyPlaceDetailSheet
      v-if="selectedPlace"
      :place="selectedPlace"
      @close="selectedPlace = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { fetchNearbyStores } from '@/api/stores'
import { haversineMeters } from '@/utils/geo'
import BaseButton from '@/components/ui/BaseButton.vue'
import NearbyPlaceDetailSheet from '@/components/map/NearbyPlaceDetailSheet.vue'
import KakaoMap from '@/components/map/KakaoMap.vue'

const router = useRouter()
const rideStore = useRideStore()
const historyStore = useHistoryStore()

/** 출발·반납 착한 대여소 — 결과 그리드에 각각 한 칸씩 (미션 스탬프 개수에는 미포함) */
const kindStationBonusStamps = computed(() => {
  const items = []
  if (rideStore.choseKindStationAtRent) {
    items.push({ id: 'kind-pickup', label: '착한 출발' })
  }
  if (rideStore.choseKindStation) {
    items.push({ id: 'kind-return', label: '착한 반납' })
  }
  return items
})

/** 여행 요약: 미션 + 대여소 스탬프 합계 */
const totalStampCount = computed(
  () => rideStore.stamps.length + kindStationBonusStamps.value.length
)

const summary = { distance: '4.2km', time: '38분' }

/**
 * 방문 코스: 짧은 글은 큰 글자로 한 줄이 너비를 쓰고(꽉 찬 느낌),
 * 넘칠 때만 글자 크기를 줄임. 최소 글자(12px)에서도 넘치면 그때만 균일 scale.
 * (7px + scale 이중 축소로 너무 작아지던 문제 제거)
 */
const courseFitOuter = ref(null)
const courseFitInner = ref(null)
const courseRouteFontPx = ref(17)
/** 1 미만: 최소 글자에서도 넘칠 때만 한 번 축소 */
const courseRouteScale = ref(1)

const courseRouteMidStyle = computed(() => {
  const s = courseRouteScale.value
  if (s >= 0.998) return {}
  return {
    display: 'inline-block',
    verticalAlign: 'top',
    transform: `scale(${s})`,
    transformOrigin: 'left top'
  }
})

/** 짧은 코스명일 때 기본으로 쓸 큰 글자 */
const COURSE_FONT_MAX = 17
/** 이 이하로는 글자 크기 줄이지 않고 scale만 사용(가독성 하한) */
const COURSE_FONT_MIN = 12
const COURSE_FONT_STEP = 0.5
const COURSE_WIDTH_PAD = 2

function fitCourseRouteFont() {
  const outer = courseFitOuter.value
  const inner = courseFitInner.value
  if (!outer || !inner) return
  const maxW = Math.max(0, outer.clientWidth - COURSE_WIDTH_PAD)
  if (maxW <= 0) return

  courseRouteScale.value = 1

  let fs = COURSE_FONT_MAX
  inner.style.fontSize = `${fs}px`
  void inner.offsetWidth
  while (fs > COURSE_FONT_MIN && inner.scrollWidth > maxW) {
    fs -= COURSE_FONT_STEP
    inner.style.fontSize = `${fs}px`
    void inner.offsetWidth
  }
  courseRouteFontPx.value = fs
  inner.style.removeProperty('font-size')

  nextTick(() => {
    requestAnimationFrame(() => {
      const innerEl = courseFitInner.value
      const outerEl = courseFitOuter.value
      if (!innerEl || !outerEl) return
      const avail = Math.max(0, outerEl.clientWidth - COURSE_WIDTH_PAD)
      void innerEl.offsetWidth
      const natural = innerEl.scrollWidth
      if (natural > avail && natural > 0) {
        courseRouteScale.value = Math.min(1, avail / natural)
      } else {
        courseRouteScale.value = 1
      }
    })
  })
}

let courseFitObserver = null

watch(
  () => rideStore.destinations,
  () => nextTick(fitCourseRouteFont),
  { deep: true }
)

const nearbyPlaces = ref([])
const isLoadingPlaces = ref(false)
const placesError = ref(null)
const selectedCategory = ref('all')
const nearbyPlacesPage = ref(1)
const PLACES_PAGE_SIZE = 5

const CATEGORY_TABS = [
  { id: 'all',        label: '전체' },
  { id: 'cafe',       label: '카페' },
  { id: 'restaurant', label: '식당' },
  { id: 'bar',        label: '주점' },
  { id: 'etc',        label: '기타' },
]

/** 카테고리 필터 후 거리순(가까운 순) */
const sortedFilteredPlaces = computed(() => {
  const list =
    selectedCategory.value === 'all'
      ? nearbyPlaces.value
      : nearbyPlaces.value.filter((p) => p.category === selectedCategory.value)
  return [...list].sort(
    (a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity)
  )
})

const nearbyPlacesPageCount = computed(() =>
  Math.max(1, Math.ceil(sortedFilteredPlaces.value.length / PLACES_PAGE_SIZE))
)

const pagedPlaces = computed(() => {
  const start = (nearbyPlacesPage.value - 1) * PLACES_PAGE_SIZE
  return sortedFilteredPlaces.value.slice(start, start + PLACES_PAGE_SIZE)
})

watch(selectedCategory, () => {
  nearbyPlacesPage.value = 1
})

watch(nearbyPlacesPageCount, (max) => {
  if (nearbyPlacesPage.value > max) nearbyPlacesPage.value = max
})

function formatPlaceDistance(place) {
  const m = place?.distanceM
  if (m == null || !Number.isFinite(m) || m === Number.POSITIVE_INFINITY) {
    return '—'
  }
  if (m < 1000) return `${Math.round(m)}m`
  return `${(m / 1000).toFixed(1)}km`
}

// 해당 카테고리에 아이템이 있을 때만 탭을 보여줌
const visibleTabs = computed(() => {
  const usedCategories = new Set(nearbyPlaces.value.map(p => p.category))
  return CATEGORY_TABS.filter(t => t.id === 'all' || usedCategories.has(t.id))
})

const mapMarkers = computed(() => {
  const destMarkers = rideStore.destinations
    .filter(d => d.lat && d.lng)
    .map((d, i) => ({
      lat: Number(d.lat),
      lng: Number(d.lng),
      label: String(i + 1),
      id: `dest-${i}`
    }))

  const nearbyMarkers = sortedFilteredPlaces.value
    .filter(p => p.lat && p.lng)
    .map(p => ({
      lat: Number(p.lat),
      lng: Number(p.lng),
      label: p.emoji,
      id: `nearby-${p.id}`,
      nearbyPlace: true,
      place: p
    }))

  return [...destMarkers, ...nearbyMarkers]
})

const selectedPlace = ref(null)

const CATEGORY_META = {
  cafe:       { label: '카페', badge: 'bg-amber-100 text-amber-700' },
  restaurant: { label: '식당', badge: 'bg-orange-100 text-orange-700' },
  bar:        { label: '주점', badge: 'bg-purple-100 text-purple-700' },
  etc:        { label: '기타', badge: 'bg-gray-100 text-gray-600' },
}

// 식당은 중분류명(indsMclsCdNm), 기타는 소분류명(indsSclsCdNm) 그대로 표시
function categoryLabel(place) {
  if (place.category === 'restaurant' && place.midCategory) return place.midCategory
  if (place.category === 'etc' && place.subCategory) return place.subCategory
  return CATEGORY_META[place.category]?.label ?? '기타'
}
function categoryBadge(cat) {
  return CATEGORY_META[cat]?.badge ?? 'bg-gray-100 text-gray-600'
}

function openPlaceDetail(place) {
  selectedPlace.value = place
}

/** 결과 지도에서 주변상권 마커 탭 시 목록과 동일하게 상세 시트 */
function onMapMarkerClick(marker) {
  if (marker?.nearbyPlace && marker.place) {
    openPlaceDetail(marker.place)
  }
}

async function loadNearbyPlaces() {
  const destinations = rideStore.destinations
  if (!destinations.length) return

  const last = destinations[destinations.length - 1]
  if (!last?.lat || !last?.lng) return

  isLoadingPlaces.value = true
  placesError.value = null

  try {
    const raw = await fetchNearbyStores(last.lat, last.lng, 500)
    const alat = Number(last.lat)
    const alng = Number(last.lng)
    nearbyPlaces.value = raw.map((p) => {
      const plat = p.lat != null ? Number(p.lat) : NaN
      const plng = p.lng != null ? Number(p.lng) : NaN
      const distanceM =
        Number.isFinite(plat) && Number.isFinite(plng)
          ? haversineMeters(alat, alng, plat, plng)
          : Number.POSITIVE_INFINITY
      return { ...p, distanceM }
    })
    nearbyPlaces.value.sort((a, b) => a.distanceM - b.distanceM)
    nearbyPlacesPage.value = 1
  } catch (err) {
    console.error('[NearbyStores]', err)
    placesError.value = '주변 상권을 불러오지 못했어요'
  } finally {
    isLoadingPlaces.value = false
  }
}

onMounted(() => {
  loadNearbyPlaces()
  nextTick(() => {
    fitCourseRouteFont()
    const el = courseFitOuter.value
    if (el && typeof ResizeObserver !== 'undefined') {
      courseFitObserver = new ResizeObserver(() => {
        nextTick(fitCourseRouteFont)
      })
      courseFitObserver.observe(el)
    }
  })
})

onBeforeUnmount(() => {
  if (courseFitObserver && courseFitOuter.value) {
    courseFitObserver.unobserve(courseFitOuter.value)
  }
  courseFitObserver?.disconnect()
  courseFitObserver = null
})

function onGoHome() {
  historyStore.addRecord({
    route: rideStore.destinations.map(d => d.spotName).join(' → '),
    stamps: [...rideStore.stamps],
    duration: summary.time,
    distance: summary.distance
  })
  rideStore.resetRide()
  router.push('/')
}
</script>
