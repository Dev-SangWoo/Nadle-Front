<template>
  <div class="flex flex-col h-full">
    <!-- 지도 미리보기 (상단 절반) -->
    <div class="flex-1 min-h-0 relative">
      <MapPreviewSection :destinations="rideStore.destinations" />
    </div>

    <!-- 하단 패널: AI 추천 결과 + 챗봇 재조정 -->
    <div class="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-6 flex flex-col gap-4 max-h-[55%] overflow-y-auto">
      <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1 flex-shrink-0" />

      <p class="text-base font-bold text-gray-800 flex-shrink-0">AI 추천 코스</p>

      <!-- 추천 관광지 리스트 -->
      <div class="flex flex-col gap-2 flex-shrink-0">
        <button
          v-for="(dest, idx) in rideStore.destinations"
          :key="idx"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl w-full text-left active:bg-gray-100 transition-colors"
          @click="openDetail(dest)"
        >
          <span class="w-6 h-6 rounded-full bg-nadle-green text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
            {{ idx + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ dest.spotName }}</p>
            <p class="text-xs text-gray-400 truncate">{{ dest.description }}</p>
          </div>
          <span class="text-gray-300 text-sm flex-shrink-0">›</span>
        </button>

        <div v-if="rideStore.destinations.length === 0" class="text-center py-4 text-gray-400 text-sm">
          AI가 코스를 생성 중이에요... 🤖
        </div>
      </div>

      <!-- 관광지 상세 시트 -->
      <SpotDetailSheet
        v-if="selectedSpot"
        :spot="selectedSpot"
        @close="selectedSpot = null"
      />

      <!-- 챗봇 재조정 -->
      <div class="flex-shrink-0">
        <p class="text-sm text-gray-500 mb-2">마음에 안 드시면 조정해보세요</p>
        <AiChatPrompt placeholder="예: 한 곳 더 추가해줘 / 카페는 빼줘" @submit="onAdjust" />
      </div>

      <!-- 확정 버튼 -->
      <BaseButton @click="onConfirm" class="flex-shrink-0">
        이 코스로 출발할게요 🚲
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import MapPreviewSection from '@/components/map/MapPreviewSection.vue'
import AiChatPrompt from '@/components/ai/AiChatPrompt.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SpotDetailSheet from '@/components/map/SpotDetailSheet.vue'

const router = useRouter()
const rideStore = useRideStore()

const selectedSpot = ref(null)

function openDetail(dest) {
  selectedSpot.value = dest
}

function onAdjust(text) {
  rideStore.setPrompt(text)
  // TODO: AI API 재호출
}

function onConfirm() {
  router.push('/map/station')
}
</script>
