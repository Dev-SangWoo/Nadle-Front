<template>
  <button
    @click="$emit('select', theme)"
    class="relative overflow-hidden rounded-2xl border-2 transition-all text-left w-full active:scale-95 h-32"
    :class="selected ? 'border-nadle-green' : 'border-transparent'"
  >
    <!-- 배경 이미지 -->
    <img
      :src="theme.image"
      :alt="theme.title"
      class="absolute inset-0 w-full h-full object-cover"
      draggable="false"
    />
    <!-- 반투명 오버레이 -->
    <div
      class="absolute inset-0 transition-colors duration-200"
      :class="selected ? 'bg-nadle-green/55' : 'bg-black/45'"
    />
    <!-- 선택 표시 체크 -->
    <div
      v-if="selected"
      class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
    >
      <svg class="w-3 h-3 text-nadle-green" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <!-- 텍스트 -->
    <div class="relative z-10 flex flex-col justify-end h-full p-3">
      <p class="text-sm font-bold text-white drop-shadow-sm">{{ theme.title }}</p>
      <p class="text-xs text-white/80 mt-0.5 drop-shadow-sm">{{ theme.desc }}</p>
    </div>
  </button>
</template>

<script setup>
defineProps({
  theme: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

defineEmits(['select'])
</script>
