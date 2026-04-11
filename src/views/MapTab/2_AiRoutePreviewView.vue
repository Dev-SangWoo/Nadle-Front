<template>
  <div class="flex flex-col h-full">
    <!-- 지도 미리보기 (상단 절반) -->
    <div class="flex-1 min-h-0 relative">
      <MapPreviewSection :destinations="rideStore.destinations" />
    </div>

    <!-- 하단 패널: AI 추천 결과 + 챗봇 재조정 -->
    <div class="bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-6 flex flex-col gap-4 max-h-[55%] overflow-y-auto">
      <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1 flex-shrink-0" />

      <div class="flex-shrink-0">
        <p class="text-base font-bold text-gray-800">추천 코스</p>
        <p class="text-xs text-gray-500 mt-0.5">
          AI 추천 · 대여 기준 위치 + 예상 120분 · 마음에 안 들면 아래에서 수정 요청
        </p>
        <p
          v-if="rideStore.recommendFallback && !rideStore.destinationsError"
          class="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2 leading-relaxed"
        >
          AI 추천을 불러오지 못해 주변 TOUR 관광지로 대체했어요. 서버 상태를 확인하거나 잠시 후 다시 시도해 주세요.
        </p>
      </div>

      <!-- 추천 관광지 리스트 -->
      <div class="flex flex-col gap-2 flex-shrink-0">
        <div
          v-if="rideStore.destinationsLoading"
          class="text-center py-8 text-gray-500 text-sm space-y-1"
        >
          <p>AI가 코스를 짜는 중이에요…</p>
          <p v-if="locationStore.status === 'loading'" class="text-xs text-gray-400">
            현재 위치를 확인하는 데 잠시 걸릴 수 있어요.
          </p>
        </div>

        <div
          v-else-if="rideStore.destinationsError"
          class="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800"
        >
          <p class="font-medium">불러오기 실패</p>
          <p class="text-red-700/90 mt-1 text-xs leading-relaxed">{{ rideStore.destinationsError }}</p>
          <button
            type="button"
            class="mt-3 text-xs font-semibold text-nadle-green underline"
            @click="rideStore.loadRouteRecommendations()"
          >
            다시 시도
          </button>
        </div>

        <template v-else>
          <button
            v-for="(dest, idx) in rideStore.destinations"
            :key="dest.spotId ?? idx"
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

          <div
            v-if="rideStore.destinations.length === 0"
            class="text-center py-6 text-gray-400 text-sm"
          >
            표시할 관광지가 없어요. 다시 시도해 주세요.
          </div>
        </template>
      </div>

      <!-- 관광지 상세 시트 (spotId로 상세 API 조회) -->
      <SpotDetailSheet
        v-if="detailSpotId"
        :spot-id="detailSpotId"
        @close="detailSpotId = null"
      />

      <!-- 챗봇 재조정 -->
      <div class="flex-shrink-0">
        <p class="text-sm text-gray-500 mb-2">마음에 안 드시면 조정해보세요</p>
        <AiChatPrompt placeholder="예: 한 곳 더 추가해줘 / 카페는 빼줘" @submit="onAdjust" />
      </div>

      <!-- 확정 버튼 -->
      <BaseButton
        class="flex-shrink-0"
        :disabled="rideStore.destinationsLoading || rideStore.destinations.length === 0"
        @click="onConfirm"
      >
        이 코스로 출발할게요 🚲
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import { useLocationStore } from '@/stores/useLocationStore'
import MapPreviewSection from '@/components/map/MapPreviewSection.vue'
import AiChatPrompt from '@/components/ai/AiChatPrompt.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SpotDetailSheet from '@/components/map/SpotDetailSheet.vue'

const router = useRouter()
const rideStore = useRideStore()
const locationStore = useLocationStore()

/** 열려 있는 관광지 상세 시트의 spotId (null 이면 닫힘) */
const detailSpotId = ref(null)

onMounted(() => {
  rideStore.loadRouteRecommendations()
})

/** GPS가 대기 끝난 뒤에야 잡히면 시청 기준 목록이 나올 수 있음 → 좌표가 처음 생길 때 한 번만 재조회 */
const refetchedForLateGps = ref(false)
watch(
  () => locationStore.lat,
  (la, prevLa) => {
    if (refetchedForLateGps.value) return
    if (la == null || !Number.isFinite(Number(la))) return
    if (locationStore.lng == null || !Number.isFinite(Number(locationStore.lng))) return
    if (locationStore.status !== 'ok') return
    if (prevLa != null) return
    if (rideStore.destinationsLoading) return
    if (!rideStore.destinations.length) return
    refetchedForLateGps.value = true
    rideStore.loadRouteRecommendations()
  }
)

function openDetail(dest) {
  if (dest?.spotId != null) {
    detailSpotId.value = String(dest.spotId)
  }
}

function onAdjust(text) {
  const t = text?.trim()
  if (!t) return
  rideStore.loadRouteRecommendations({ refinement: t })
}

function onConfirm() {
  router.push('/map/station')
}
</script>
