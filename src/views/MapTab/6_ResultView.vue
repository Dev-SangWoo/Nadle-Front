<template>
  <div class="flex flex-col h-full bg-nadle-light overflow-y-auto">
    <!-- 헤더 -->
    <div class="flex flex-col items-center pt-10 pb-6 px-6 bg-white">
      <p class="text-4xl mb-2">🎉</p>
      <h1 class="text-2xl font-bold text-gray-800 mb-1">마실 완료!</h1>
      <p class="text-sm text-gray-500">오늘도 멋진 동네 여행이었어요</p>
    </div>

    <!-- 획득한 스탬프 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <p class="text-sm font-semibold text-gray-600 mb-3">획득한 스탬프</p>
      <div class="flex gap-3 flex-wrap">
        <div
          v-for="stamp in rideStore.stamps"
          :key="stamp.name"
          class="flex flex-col items-center"
        >
          <span class="text-4xl">🏅</span>
          <p class="text-xs text-gray-500 mt-1 text-center">{{ stamp.name }}</p>
        </div>
      </div>
    </div>

    <!-- 여행 요약 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <p class="text-sm font-semibold text-gray-600 mb-3">여행 요약</p>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div>
          <p class="text-xl font-bold text-nadle-green">{{ summary.distance }}</p>
          <p class="text-xs text-gray-400">총 거리</p>
        </div>
        <div>
          <p class="text-xl font-bold text-nadle-green">{{ summary.time }}</p>
          <p class="text-xs text-gray-400">소요 시간</p>
        </div>
        <div>
          <p class="text-xl font-bold text-nadle-green">{{ rideStore.stamps.length }}</p>
          <p class="text-xs text-gray-400">스탬프</p>
        </div>
      </div>
    </div>

    <!-- 방문한 코스 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <p class="text-sm font-semibold text-gray-600 mb-3">방문 코스</p>
      <div class="flex flex-col gap-2">
        <div
          v-for="(dest, idx) in rideStore.destinations"
          :key="idx"
          class="flex items-center gap-3"
        >
          <span class="w-6 h-6 rounded-full bg-nadle-green text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
            {{ idx + 1 }}
          </span>
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ dest.spotName }}</p>
            <p class="text-xs text-gray-400">{{ dest.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 주변에 들릴만한 곳 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-semibold text-gray-600">주변에 들릴만한 곳 🛍️</p>
        <span class="text-xs text-gray-400">루트 주변 상권</span>
      </div>
      <div class="flex flex-col gap-3">
        <button
          v-for="place in nearbyPlaces"
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
                {{ categoryLabel(place.category) }}
              </span>
            </div>
            <p class="text-xs text-gray-400 truncate">{{ place.address }}</p>
          </div>
          <span class="text-gray-300 flex-shrink-0">›</span>
        </button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import BaseButton from '@/components/ui/BaseButton.vue'
import NearbyPlaceDetailSheet from '@/components/map/NearbyPlaceDetailSheet.vue'

const router = useRouter()
const rideStore = useRideStore()
const historyStore = useHistoryStore()

// TODO: 실제 거리/시간은 주행 중 누적
const summary = { distance: '4.2km', time: '38분' }

// TODO: 백엔드 API로 루트 종료 좌표 기반 상권 3개 받아오기
const nearbyPlaces = ref([
  {
    id: 1,
    emoji: '☕',
    name: '카페 마실',
    category: 'cafe',
    address: '서울시 종로구 창경궁로 100',
    description: '고즈넉한 한옥 골목 사이에 자리한 감성 카페. 직접 로스팅한 원두와 계절 음료를 선보이며, 창가 자리에서 골목 풍경을 즐기기 좋아요.',
    lat: 37.5796,
    lng: 126.9946
  },
  {
    id: 2,
    emoji: '🍜',
    name: '북촌 손칼국수',
    category: 'restaurant',
    address: '서울시 종로구 계동길 42',
    description: '30년 전통의 손칼국수 전문점. 멸치 육수를 오래 끓여 깊고 구수한 국물 맛이 일품이며 현지인들이 즐겨 찾는 곳입니다.',
    lat: 37.5831,
    lng: 126.9836
  },
  {
    id: 3,
    emoji: '🥐',
    name: '삼청 베이커리',
    category: 'bakery',
    address: '서울시 종로구 삼청로 45',
    description: '삼청동 언덕길 옆 작은 베이커리. 매일 아침 직접 구운 소금빵과 크루아상이 인기이며 테이크아웃 커피도 맛있어요.',
    lat: 37.5842,
    lng: 126.9803
  }
])

const selectedPlace = ref(null)

const CATEGORY_META = {
  cafe:       { label: '카페',    badge: 'bg-amber-100 text-amber-700' },
  restaurant: { label: '식당',    badge: 'bg-orange-100 text-orange-700' },
  bakery:     { label: '베이커리', badge: 'bg-yellow-100 text-yellow-700' },
  bar:        { label: '바·주점', badge: 'bg-purple-100 text-purple-700' },
  shopping:   { label: '쇼핑',    badge: 'bg-pink-100 text-pink-700' },
  attraction: { label: '명소',    badge: 'bg-blue-100 text-blue-700' },
}

function categoryLabel(cat) {
  return CATEGORY_META[cat]?.label ?? '상권'
}
function categoryBadge(cat) {
  return CATEGORY_META[cat]?.badge ?? 'bg-gray-100 text-gray-600'
}

function openPlaceDetail(place) {
  selectedPlace.value = place
}

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
