<template>
  <button
    v-bind="$attrs"
    class="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
    :class="[
      disabled
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-nadle-green text-white shadow-md',
      $attrs.class
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false }
})
</script>
