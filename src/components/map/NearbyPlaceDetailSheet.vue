<template>
  <BottomSheet @close="$emit('close')">
    <!-- 카테고리 뱃지 + 이름 -->
    <div class="flex items-start gap-3 mb-4">
      <span class="text-4xl flex-shrink-0">{{ place.emoji }}</span>
      <div class="flex-1 min-w-0">
        <span
          class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-1"
          :class="categoryStyle.badge"
        >
          {{ categoryStyle.label }}
        </span>
        <h2 class="text-xl font-bold text-gray-900 leading-tight">{{ place.name }}</h2>
      </div>
    </div>

    <!-- 주소 -->
    <div class="flex items-start gap-2 mb-4 bg-gray-50 rounded-xl px-4 py-3">
      <span class="text-base flex-shrink-0 mt-0.5">📍</span>
      <p class="text-sm text-gray-600 leading-relaxed">{{ place.address }}</p>
    </div>

    <!-- 간단 설명 -->
    <p class="text-sm text-gray-700 leading-relaxed mb-6">
      {{ place.description }}
    </p>

    <!-- 지도로 연결 버튼 -->
    <a
      :href="kakaoMapUrl"
      target="_blank"
      rel="noopener"
      class="block w-full py-4 rounded-2xl text-base font-bold text-center bg-nadle-green text-white shadow-md active:scale-95 transition-all mb-3"
    >
      🗺️ 지도로 연결
    </a>

    <!-- 닫기 -->
    <button
      class="block w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-100 active:bg-gray-200 transition-all"
      @click="$emit('close')"
    >
      닫기
    </button>
  </BottomSheet>
</template>

<script setup>
import { computed } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'

const props = defineProps({
  /**
   * 주변 상권 객체
   * { id, name, emoji, category, address, description, lat, lng }
   */
  place: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const CATEGORY_MAP = {
  cafe:        { label: '카페',   badge: 'bg-amber-100 text-amber-700' },
  restaurant:  { label: '식당',   badge: 'bg-orange-100 text-orange-700' },
  bakery:      { label: '베이커리', badge: 'bg-yellow-100 text-yellow-700' },
  bar:         { label: '바·주점', badge: 'bg-purple-100 text-purple-700' },
  shopping:    { label: '쇼핑',   badge: 'bg-pink-100 text-pink-700' },
  attraction:  { label: '명소',   badge: 'bg-blue-100 text-blue-700' },
}

const DEFAULT_CATEGORY = { label: '상권', badge: 'bg-gray-100 text-gray-600' }

const categoryStyle = computed(() => CATEGORY_MAP[props.place?.category] ?? DEFAULT_CATEGORY)

const kakaoMapUrl = computed(() => {
  const { name, lat, lng } = props.place
  if (lat && lng) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(name)}`
})
</script>
