<template>
  <div class="flex flex-col h-full">
    <!-- 상단: 카카오맵 딥링크 영역 (절반) -->
    <div class="flex-1 min-h-0 relative">
      <MapPreviewSection
        :destinations="rideStore.destinations"
        :current-index="rideStore.currentDestIndex"
        :selected-spot-id="detailSpotId"
        show-route
        @marker-click="onMapMarkerClick"
      />
    </div>

    <!-- 하단: 미션 대시보드 (절반) -->
    <div class="bg-white border-t border-gray-100 px-5 pt-4 pb-6 flex flex-col gap-4 h-[45%]">
      <!-- 스탬프 진행 현황 -->
      <div class="flex gap-2 justify-center">
        <span
          v-for="(dest, idx) in rideStore.destinations"
          :key="idx"
          class="text-2xl transition-all"
          :class="idx < rideStore.currentDestIndex ? 'opacity-100' : 'opacity-30'"
        >
          🏅
        </span>
      </div>

      <!-- 현재 미션 카드 -->
      <CurrentMissionCard
        :destination="currentDestination"
        :mission-type="currentMissionType"
      />

      <!-- 도착 완료 버튼 -->
      <ArrivalConfirmButton
        :disabled="missionPrepareLoading"
        :loading="missionPrepareLoading"
        @arrived="onArrived"
      />
    </div>

    <!-- 미션 모달 -->
    <MissionModal
      v-if="showMission"
      :type="currentMissionType"
      :quiz-payload="quizPayload"
      @complete="onMissionComplete"
    />

    <SpotDetailSheet
      v-if="detailSpotId"
      :spot-id="detailSpotId"
      @close="detailSpotId = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import { fetchSpotQuiz } from '@/api/spots'
import MapPreviewSection from '@/components/map/MapPreviewSection.vue'
import SpotDetailSheet from '@/components/map/SpotDetailSheet.vue'
import CurrentMissionCard from '@/components/mission/CurrentMissionCard.vue'
import ArrivalConfirmButton from '@/components/mission/ArrivalConfirmButton.vue'
import MissionModal from '@/components/mission/MissionModal.vue'

const router = useRouter()
const rideStore = useRideStore()

const showMission = ref(false)
const missionPrepareLoading = ref(false)
/** 퀴즈 미션 시 API 문항 (실패 시 null 이고 미션 타입이 카메라/휴식으로 바뀜) */
const quizPayload = ref(null)
/** 지도 마커 탭 시 상세 시트 (spotId) */
const detailSpotId = ref(null)

function onMapMarkerClick(marker) {
  const sid = marker?.spotId ?? null
  if (sid != null && String(sid).trim() !== '') {
    detailSpotId.value = String(sid)
  }
}

function shuffled(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const missionQueue = shuffled(['quiz', 'camera', 'rest'])
const currentMissionType = ref(missionQueue[0])

const currentDestination = computed(
  () => rideStore.destinations[rideStore.currentDestIndex] ?? null
)

function pickNonQuizMission() {
  const opts = ['camera', 'rest']
  return opts[Math.floor(Math.random() * opts.length)]
}

async function onArrived() {
  quizPayload.value = null
  const dest = currentDestination.value
  const sid = dest?.spotId != null ? String(dest.spotId).trim() : ''

  if (currentMissionType.value === 'quiz') {
    if (!sid) {
      currentMissionType.value = pickNonQuizMission()
      showMission.value = true
      return
    }
    missionPrepareLoading.value = true
    try {
      quizPayload.value = await fetchSpotQuiz(sid)
      showMission.value = true
    } catch {
      quizPayload.value = null
      currentMissionType.value = pickNonQuizMission()
      showMission.value = true
    } finally {
      missionPrepareLoading.value = false
    }
    return
  }

  showMission.value = true
}

function onMissionComplete() {
  showMission.value = false
  quizPayload.value = null
  rideStore.collectStamp(currentDestination.value?.spotName)

  const isLast = rideStore.currentDestIndex >= rideStore.destinations.length
  if (isLast) {
    router.push('/map/return')
  } else {
    currentMissionType.value = missionQueue[rideStore.currentDestIndex]
  }
}
</script>
