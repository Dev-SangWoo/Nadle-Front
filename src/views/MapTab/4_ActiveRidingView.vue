<template>
  <div class="flex flex-col h-full">
    <!-- 상단: 카카오맵 딥링크 영역 (절반) -->
    <div class="flex-1 min-h-0 relative">
      <MapPreviewSection
        :destinations="rideStore.destinations"
        :current-index="rideStore.currentDestIndex"
        show-route
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
      <ArrivalConfirmButton @arrived="onArrived" />
    </div>

    <!-- 미션 모달 -->
    <MissionModal
      v-if="showMission"
      :type="currentMissionType"
      @complete="onMissionComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRideStore } from '@/stores/useRideStore'
import MapPreviewSection from '@/components/map/MapPreviewSection.vue'
import CurrentMissionCard from '@/components/mission/CurrentMissionCard.vue'
import ArrivalConfirmButton from '@/components/mission/ArrivalConfirmButton.vue'
import MissionModal from '@/components/mission/MissionModal.vue'

const router = useRouter()
const rideStore = useRideStore()

const showMission = ref(false)
const missionTypes = ['quiz', 'camera', 'rest']
const currentMissionType = ref(missionTypes[Math.floor(Math.random() * missionTypes.length)])

const currentDestination = computed(
  () => rideStore.destinations[rideStore.currentDestIndex] ?? null
)

function onArrived() {
  showMission.value = true
}

function onMissionComplete() {
  showMission.value = false
  rideStore.collectStamp(currentDestination.value?.name)

  const isLast = rideStore.currentDestIndex >= rideStore.destinations.length
  if (isLast) {
    router.push('/map/return')
  } else {
    currentMissionType.value = missionTypes[Math.floor(Math.random() * missionTypes.length)]
  }
}
</script>
