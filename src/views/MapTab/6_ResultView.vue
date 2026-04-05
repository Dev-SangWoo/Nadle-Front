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
            <p class="text-sm font-semibold text-gray-800">{{ dest.name }}</p>
            <p class="text-xs text-gray-400">{{ dest.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 홈으로 버튼 -->
    <div class="px-4 mt-6 mb-8">
      <BaseButton @click="onGoHome">처음으로 돌아가기 🏠</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const rideStore = useRideStore()
const historyStore = useHistoryStore()

// TODO: 실제 거리/시간은 주행 중 누적
const summary = { distance: '4.2km', time: '38분' }

function onGoHome() {
  historyStore.addRecord({
    route: rideStore.destinations.map(d => d.name).join(' → '),
    stamps: [...rideStore.stamps],
    duration: summary.time,
    distance: summary.distance
  })
  rideStore.resetRide()
  router.push('/')
}
</script>
