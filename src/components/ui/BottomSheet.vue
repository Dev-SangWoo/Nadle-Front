<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl"
        style="max-height: 70vh; overflow-y: auto;"
      >
        <!-- 핸들 바 -->
        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineEmits(['close'])
</script>
