<template>
  <button
    @click="onArrived"
    class="w-full py-4 bg-nadle-green text-white rounded-2xl text-lg font-bold shadow-md active:scale-95 transition-transform"
  >
    도착 완료 🎯
  </button>
</template>

<script setup>
const emit = defineEmits(['arrived'])

function onArrived() {
  emit('arrived')
}
</script>
