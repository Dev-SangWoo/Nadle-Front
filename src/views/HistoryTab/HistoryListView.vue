<template>
  <div class="flex flex-col h-full bg-gray-50 overflow-y-auto">
    <!-- 헤더 -->
    <div class="px-5 pt-6 pb-4 bg-white">
      <h2 class="text-xl font-bold text-gray-800">여행내역</h2>
      <p class="text-sm text-gray-400 mt-1">그동안의 마실 기록이에요</p>
    </div>

    <!-- 스탬프 모아보기 -->
    <div class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-semibold text-gray-600">모은 스탬프</p>
        <span class="text-xs text-nadle-green font-bold">총 {{ totalStampCount }}개</span>
      </div>
      <div class="flex gap-2 flex-wrap">
        <span
          v-for="(stamp, idx) in historyStore.totalStamps"
          :key="idx"
          class="text-2xl"
          :title="stamp.name"
        >🏅</span>
        <span v-if="historyStore.totalStamps.length === 0" class="text-sm text-gray-400">
          아직 스탬프가 없어요. 첫 마실을 떠나볼까요?
        </span>
      </div>
    </div>

    <!-- 여행 기록 리스트 -->
    <div class="px-4 mt-4 flex flex-col gap-4 pb-6">
      <!-- 기록 카드 -->
      <div
        v-for="record in historyStore.records"
        :key="record.id"
        class="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- 카드 헤더 -->
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
          <div>
            <p class="text-sm font-bold text-gray-800">{{ record.date }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ record.route }}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="text-xs bg-nadle-green/10 text-nadle-green font-semibold px-2 py-0.5 rounded-full">
              {{ record.duration }}
            </span>
            <span class="text-xs text-gray-400">{{ record.distance }}</span>
          </div>
        </div>

        <!-- 방문 코스 -->
        <div v-if="record.destinations?.length" class="px-5 py-3 border-b border-gray-50">
          <p class="text-xs font-semibold text-gray-500 mb-2">방문 코스</p>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="(dest, idx) in record.destinations"
              :key="idx"
              class="flex items-center gap-2"
            >
              <span class="w-5 h-5 rounded-full bg-nadle-green text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                {{ idx + 1 }}
              </span>
              <span class="text-sm text-gray-700 font-medium">{{ dest.spotName }}</span>
              <span v-if="dest.description" class="text-xs text-gray-400 truncate">{{ dest.description }}</span>
            </div>
          </div>
        </div>

        <!-- 스탬프 & 착한대여소 -->
        <div class="px-5 py-3">
          <p class="text-xs font-semibold text-gray-500 mb-2">획득 스탬프</p>
          <div class="flex items-center gap-2 flex-wrap">
            <div
              v-for="(stamp, idx) in record.stamps"
              :key="idx"
              class="flex flex-col items-center"
            >
              <span class="text-2xl">🏅</span>
              <p class="text-[10px] text-gray-400 mt-0.5 text-center leading-tight max-w-[52px] truncate">
                {{ stamp.name }}
              </p>
            </div>
            <div v-if="record.choseKindStation" class="flex flex-col items-center">
              <span class="w-8 h-8 rounded-full bg-gradient-to-br from-nadle-green to-green-600 flex items-center justify-center text-base shadow-sm ring-2 ring-green-100">🚲</span>
              <p class="text-[10px] font-bold text-nadle-green mt-0.5 text-center leading-tight">착한대여소</p>
            </div>
            <span v-if="!record.stamps?.length && !record.choseKindStation" class="text-xs text-gray-400">
              스탬프 없음
            </span>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="historyStore.records.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-5xl mb-4">🚲</p>
        <p class="text-sm font-medium">아직 여행 기록이 없어요</p>
        <p class="text-xs mt-1">첫 번째 마실을 완료하면 여기에 기록돼요!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/useHistoryStore'

const historyStore = useHistoryStore()

const totalStampCount = computed(() => historyStore.totalStamps.length)
</script>
