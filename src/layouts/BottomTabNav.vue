<template>
  <nav class="flex items-center h-16 bg-white border-t border-gray-100 flex-shrink-0">
    <!-- 여행내역 탭 -->
    <RouterLink
      to="/history"
      class="flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors"
      :class="isHistory ? 'text-nadle-green' : 'text-gray-400'"
    >
      <span class="text-2xl">📖</span>
      <span>여행내역</span>
    </RouterLink>

    <!-- 코스짜기 탭 -->
    <RouterLink
      to="/"
      class="flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors"
      :class="isMap ? 'text-nadle-green' : 'text-gray-400'"
    >
      <span class="text-2xl">🗺️</span>
      <span>코스짜기</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isMap = computed(() => route.path === '/' || route.path.startsWith('/map'))
const isHistory = computed(() => route.path.startsWith('/history'))
</script>
