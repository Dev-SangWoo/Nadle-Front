<template>
  <BottomSheet @close="$emit('close')">
    <div v-if="loading" class="py-16 text-center">
      <p class="text-sm text-gray-500">관광지 정보를 불러오는 중이에요…</p>
    </div>

    <div v-else-if="error" class="py-10 px-2 text-center">
      <p class="text-sm text-red-600 leading-relaxed">{{ error }}</p>
      <button
        type="button"
        class="mt-4 text-sm font-semibold text-nadle-green underline"
        @click="loadDetail"
      >
        다시 시도
      </button>
    </div>

    <template v-else-if="spot">
      <!-- 메인 이미지 -->
      <div class="relative -mx-5 -mt-5 h-52 overflow-hidden rounded-t-3xl">
        <img
          :src="currentImage"
          :alt="spot.spotName"
          class="w-full h-full object-cover"
          @error="onImageError"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <span
          class="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow"
          :class="categoryStyle.badge"
        >
          {{ categoryStyle.icon }} {{ categoryStyle.label }}
        </span>

        <div
          v-if="spot.images && spot.images.length > 1"
          class="absolute bottom-3 right-4 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full"
        >
          {{ activeImageIdx + 1 }} / {{ spot.images.length }}
        </div>
      </div>

      <div
        v-if="spot.images && spot.images.length > 1"
        class="flex gap-2 overflow-x-auto py-3 -mx-5 px-5 no-scrollbar"
      >
        <button
          v-for="(img, i) in spot.images"
          :key="i"
          class="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all"
          :class="activeImageIdx === i ? 'border-nadle-green' : 'border-transparent'"
          @click="activeImageIdx = i"
        >
          <img :src="img" :alt="`${spot.spotName} ${i + 1}`" class="w-full h-full object-cover" />
        </button>
      </div>

      <div class="mt-3 mb-3">
        <h2 class="text-xl font-bold text-gray-900">{{ spot.spotName }}</h2>
        <p class="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <span>📍</span>{{ spot.address }}
        </p>
      </div>

      <p class="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
        {{ spot.description }}
      </p>

      <div class="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 mb-5">
        <div class="flex items-center gap-3">
          <span class="text-base">📞</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-500 mb-0.5">문의 전화</p>
            <a
              v-if="spot.tel"
              :href="`tel:${spot.tel}`"
              class="text-sm text-nadle-green font-medium"
            >
              {{ spot.tel }}
            </a>
            <p v-else class="text-sm text-gray-400">정보 없음</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-base">🗂️</span>
          <div>
            <p class="text-xs font-semibold text-gray-500 mb-0.5">분류</p>
            <p class="text-sm text-gray-800">{{ categoryStyle.label }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-base">🚲</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-500 mb-0.5">길찾기</p>
            <a
              :href="kakaoDirectionsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-nadle-green font-medium"
            >
              {{ kakaoDirectionsLabel }}
            </a>
            <p v-if="!hasMyLocationForRoute" class="text-[11px] text-gray-400 mt-1 leading-snug">
              위치 권한을 허용하면 출발이 내 위치로 잡힌 자전거 길찾기로 열려요.
            </p>
          </div>
        </div>
      </div>

      <BaseButton @click="$emit('close')">닫기</BaseButton>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { fetchSpotDetail } from '@/api/spots'
import { useLocationStore } from '@/stores/useLocationStore'
import { kakaoBicycleRouteUrl, kakaoRouteToOnlyUrl } from '@/utils/kakaoMapLinks'

const locationStore = useLocationStore()

const props = defineProps({
  /** 관광지 고유 ID — 마운트 시 상세 API 호출 */
  spotId: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'

const CATEGORY_MAP = {
  CULTURE: { label: '문화·유적', icon: '🏛️', badge: 'bg-purple-100 text-purple-700' },
  NATURE: { label: '자연·공원', icon: '🌿', badge: 'bg-green-100 text-green-700' },
  FOOD: { label: '음식·식당', icon: '🍽️', badge: 'bg-orange-100 text-orange-700' },
  TOUR: { label: '관광지', icon: '📸', badge: 'bg-blue-100 text-blue-700' }
}

const DEFAULT_CATEGORY = { label: '관광지', icon: '📍', badge: 'bg-gray-100 text-gray-600' }

const spot = ref(null)
const loading = ref(true)
const error = ref(null)
const activeImageIdx = ref(0)

const currentImage = computed(() => {
  const images = spot.value?.images
  if (images && images.length > 0) return images[activeImageIdx.value]
  return FALLBACK_IMAGE
})

const categoryStyle = computed(
  () => CATEGORY_MAP[spot.value?.category] ?? DEFAULT_CATEGORY
)

const hasMyLocationForRoute = computed(() => {
  const lat = locationStore.lat
  const lng = locationStore.lng
  return (
    lat != null &&
    lng != null &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng))
  )
})

const kakaoDirectionsUrl = computed(() => {
  const s = spot.value
  if (!s || !Number.isFinite(Number(s.lat)) || !Number.isFinite(Number(s.lng))) {
    return '#'
  }
  if (hasMyLocationForRoute.value) {
    return kakaoBicycleRouteUrl(
      locationStore.lat,
      locationStore.lng,
      s.spotName,
      s.lat,
      s.lng
    )
  }
  return kakaoRouteToOnlyUrl(s.spotName, s.lat, s.lng)
})

const kakaoDirectionsLabel = computed(() =>
  hasMyLocationForRoute.value
    ? '내 위치 → 자전거 길찾기'
    : '카카오맵 길찾기 열기'
)

watch(
  () => props.spotId,
  () => {
    loadDetail()
  }
)

watch(spot, () => {
  activeImageIdx.value = 0
})

async function loadDetail() {
  loading.value = true
  error.value = null
  spot.value = null
  try {
    spot.value = await fetchSpotDetail(props.spotId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

loadDetail()

function onImageError(e) {
  e.target.src = FALLBACK_IMAGE
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
