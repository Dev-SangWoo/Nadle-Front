<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" @click.self="$emit('complete')">
    <div class="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10">
      <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

      <div class="text-center mb-6">
        <span class="text-4xl">🎯</span>
        <h2 class="text-xl font-bold text-gray-800 mt-2">미션 수행</h2>
        <p class="text-sm text-gray-400 mt-1">미션을 완료하면 스탬프를 획득해요!</p>
      </div>

      <MissionOxQuiz v-if="resolvedType === 'quiz'" @complete="$emit('complete')" />
      <MissionCamera v-else-if="resolvedType === 'camera'" @complete="$emit('complete')" />
      <MissionRest v-else-if="resolvedType === 'rest'" @complete="$emit('complete')" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MissionOxQuiz from './MissionOxQuiz.vue'
import MissionCamera from './MissionCamera.vue'
import MissionRest from './MissionRest.vue'

const props = defineProps({
  type: { type: String, default: null }
})

defineEmits(['complete'])

const MISSION_TYPES = ['quiz', 'camera', 'rest']

const resolvedType = computed(() =>
  props.type ?? MISSION_TYPES[Math.floor(Math.random() * MISSION_TYPES.length)]
)
</script>
