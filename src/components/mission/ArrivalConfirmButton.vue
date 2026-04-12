<template>
  <button
    type="button"
    :disabled="disabled || loading"
    @click="onArrived"
    class="w-full py-4 bg-nadle-green text-white rounded-2xl text-lg font-bold shadow-md active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
  >
    <span v-if="loading">퀴즈 불러오는 중…</span>
    <span v-else>도착 완료 🎯</span>
  </button>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['arrived'])

function onArrived() {
  emit('arrived')
}
</script>
