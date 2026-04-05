<template>
  <div class="flex flex-col items-center gap-5">
    <!-- 안내 -->
    <div class="w-full bg-gray-50 rounded-2xl p-4 text-center">
      <p class="text-sm text-gray-500 mb-2">휴식 미션</p>
      <p class="text-base font-semibold text-gray-800">잠깐 쉬어가요! 타이머가 끝나면 완료돼요 ☕</p>
    </div>

    <!-- 타이머 원형 표시 -->
    <div class="relative flex items-center justify-center w-44 h-44">
      <svg class="absolute inset-0" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#E8F5E9" stroke-width="8" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="#4CAF50"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="`${progress * 2.827} 282.7`"
          transform="rotate(-90 50 50)"
          class="transition-all duration-1000"
        />
      </svg>
      <div class="text-center z-10">
        <p class="text-4xl font-bold text-nadle-green">{{ formattedTime }}</p>
        <p class="text-xs text-gray-400 mt-1">남은 시간</p>
      </div>
    </div>

    <!-- 시작/완료 버튼 -->
    <button
      v-if="!started"
      @click="startTimer"
      class="w-full py-4 bg-nadle-green text-white rounded-2xl font-bold text-base"
    >
      휴식 시작 ▶
    </button>

    <button
      v-else-if="finished"
      @click="$emit('complete')"
      class="w-full py-4 bg-nadle-green text-white rounded-2xl font-bold text-base"
    >
      스탬프 받기 🏅
    </button>

    <div v-else class="w-full py-4 bg-gray-100 rounded-2xl text-center text-gray-500 font-semibold">
      휴식 중... 🌿
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const emit = defineEmits(['complete'])

const TOTAL_SECONDS = 5 * 60 // 5분 (테스트 시 줄여서 사용)
const remaining = ref(TOTAL_SECONDS)
const started = ref(false)
const finished = ref(false)
let timer = null

const progress = computed(() => {
  return ((TOTAL_SECONDS - remaining.value) / TOTAL_SECONDS) * 100
})

const formattedTime = computed(() => {
  const m = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

function startTimer() {
  started.value = true
  timer = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      clearInterval(timer)
      finished.value = true
    }
  }, 1000)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
