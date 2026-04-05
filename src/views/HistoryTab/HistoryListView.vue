<template>
  <div class="flex flex-col h-full bg-gray-50 overflow-y-auto">
    <!-- 헤더 -->
    <div class="px-5 pt-6 pb-4 bg-white">
      <h2 class="text-xl font-bold text-gray-800">여행내역</h2>
      <p class="text-sm text-gray-400 mt-1">그동안의 마실 기록이에요</p>
    </div>

    <!-- 스탬프 모아보기 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <p class="text-sm font-semibold text-gray-600 mb-3">모은 스탬프</p>
      <div class="flex gap-2 flex-wrap">
        <span
          v-for="(stamp, idx) in allStamps"
          :key="idx"
          class="text-3xl"
        >
          🏅
        </span>
        <span v-if="allStamps.length === 0" class="text-sm text-gray-400">
          아직 스탬프가 없어요. 첫 마실을 떠나볼까요?
        </span>
      </div>
    </div>

    <!-- 여행 기록 리스트 -->
    <div class="px-4 mt-4 flex flex-col gap-3 pb-6">
      <div
        v-for="record in historyRecords"
        :key="record.id"
        class="bg-white rounded-2xl p-4 shadow-sm"
      >
        <div class="flex justify-between items-start mb-2">
          <p class="font-semibold text-gray-800">{{ record.date }}</p>
          <span class="text-xs text-gray-400">{{ record.duration }}</span>
        </div>
        <p class="text-sm text-gray-500 mb-3">{{ record.route }}</p>
        <div class="flex gap-2">
          <span
            v-for="(stamp, idx) in record.stamps"
            :key="idx"
            class="text-xl"
          >
            🏅
          </span>
        </div>
      </div>

      <div v-if="historyRecords.length === 0" class="text-center py-10 text-gray-400">
        <p class="text-4xl mb-3">🚲</p>
        <p class="text-sm">아직 여행 기록이 없어요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// TODO: Pinia 스토어 또는 API에서 여행 기록 불러오기
const allStamps = ref([])
const historyRecords = ref([])
</script>
