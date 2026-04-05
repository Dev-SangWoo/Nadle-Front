<template>
  <button
    @click="$emit('select', theme)"
    class="flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all text-left w-full active:scale-95"
    :class="selected
      ? 'border-nadle-green bg-nadle-light'
      : 'border-gray-100 bg-white'"
  >
    <span class="text-3xl">{{ theme.emoji }}</span>
    <p class="text-sm font-bold text-gray-800 mt-1">{{ theme.title }}</p>
    <p class="text-xs text-gray-400">{{ theme.desc }}</p>
  </button>
</template>

<script setup>
defineProps({
  theme: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

defineEmits(['select'])
</script>
