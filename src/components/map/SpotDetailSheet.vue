<template>
  <BottomSheet @close="$emit('close')">
    <!-- 메인 이미지 -->
    <div class="relative -mx-5 -mt-5 h-52 overflow-hidden rounded-t-3xl">
      <img
        :src="currentImage"
        :alt="spot.spotName"
        class="w-full h-full object-cover"
        @error="onImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      <!-- 카테고리 뱃지 -->
      <span
        class="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow"
        :class="categoryStyle.badge"
      >
        {{ categoryStyle.icon }} {{ categoryStyle.label }}
      </span>

      <!-- 이미지 인디케이터 -->
      <div
        v-if="spot.images && spot.images.length > 1"
        class="absolute bottom-3 right-4 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full"
      >
        {{ activeImageIdx + 1 }} / {{ spot.images.length }}
      </div>
    </div>

    <!-- 이미지 썸네일 스크롤 (이미지 2장 이상일 때) -->
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

    <!-- 이름 + 주소 -->
    <div class="mt-3 mb-3">
      <h2 class="text-xl font-bold text-gray-900">{{ spot.spotName }}</h2>
      <p class="text-sm text-gray-500 mt-1 flex items-center gap-1">
        <span>📍</span>{{ spot.address }}
      </p>
    </div>

    <!-- 설명 -->
    <p class="text-sm text-gray-700 leading-relaxed mb-4">
      {{ spot.description }}
    </p>

    <!-- 정보 카드 -->
    <div class="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 mb-5">
      <!-- 전화번호 -->
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

      <!-- 카테고리 -->
      <div class="flex items-center gap-3">
        <span class="text-base">🗂️</span>
        <div>
          <p class="text-xs font-semibold text-gray-500 mb-0.5">분류</p>
          <p class="text-sm text-gray-800">{{ categoryStyle.label }}</p>
        </div>
      </div>

      <!-- 지도 좌표 (나중에 지도 앱 연결용) -->
      <div class="flex items-center gap-3">
        <span class="text-base">🗺️</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-gray-500 mb-0.5">위치</p>
          <a
            :href="`https://map.kakao.com/link/map/${spot.spotName},${spot.lat},${spot.lng}`"
            target="_blank"
            rel="noopener"
            class="text-sm text-nadle-green font-medium"
          >
            카카오맵에서 보기
          </a>
        </div>
      </div>
    </div>

    <!-- 닫기 버튼 -->
    <BaseButton @click="$emit('close')">닫기</BaseButton>
  </BottomSheet>
</template>

<script setup>
import { ref, computed } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  /** API result 객체 그대로 전달
   * { spotId, spotName, description, category, address, lat, lng, images, tel }
   */
  spot: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'

const CATEGORY_MAP = {
  CULTURE: { label: '문화·유적', icon: '🏛️', badge: 'bg-purple-100 text-purple-700' },
  NATURE:  { label: '자연·공원', icon: '🌿', badge: 'bg-green-100 text-green-700' },
  FOOD:    { label: '음식·식당', icon: '🍽️', badge: 'bg-orange-100 text-orange-700' },
  TOUR:    { label: '관광지',    icon: '📸', badge: 'bg-blue-100 text-blue-700' }
}

const DEFAULT_CATEGORY = { label: '관광지', icon: '📍', badge: 'bg-gray-100 text-gray-600' }

const activeImageIdx = ref(0)

const currentImage = computed(() => {
  const images = props.spot?.images
  if (images && images.length > 0) return images[activeImageIdx.value]
  return FALLBACK_IMAGE
})

const categoryStyle = computed(() => CATEGORY_MAP[props.spot?.category] ?? DEFAULT_CATEGORY)

function onImageError(e) {
  e.target.src = FALLBACK_IMAGE
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
