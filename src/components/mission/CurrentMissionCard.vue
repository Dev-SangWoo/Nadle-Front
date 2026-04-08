<template>
  <div class="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
    <div class="text-4xl flex-shrink-0">{{ missionEmoji }}</div>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-gray-400 mb-0.5">현재 목적지</p>
      <p class="text-base font-bold text-gray-800 truncate">{{ destination?.spotName ?? '—' }}</p>
      <p class="text-xs text-nadle-green font-semibold mt-0.5">{{ missionLabel }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  destination: { type: Object, default: null },
  missionType: { type: String, default: 'quiz' }
})

const missionMap = {
  quiz:   { emoji: '❓', label: 'O/X 퀴즈 미션' },
  camera: { emoji: '📷', label: '사진 인증 미션' },
  rest:   { emoji: '🌿', label: '휴식 타이머 미션' }
}

const missionEmoji = computed(() => missionMap[props.missionType]?.emoji ?? '🎯')
const missionLabel = computed(() => missionMap[props.missionType]?.label ?? '미션')
</script>
