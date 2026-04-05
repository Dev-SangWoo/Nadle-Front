<template>
  <div class="flex flex-col h-full">
    <!-- 상단 로고 네비 -->
    <TopLogoNav />

    <!-- 라우터 뷰 (메인 콘텐츠 영역) -->
    <main class="flex-1 overflow-hidden relative">
      <RouterView />
    </main>

    <!-- 하단 탭 네비 -->
    <BottomTabNav />
  </div>
</template>

<script setup>
import TopLogoNav from '@/layouts/TopLogoNav.vue'
import BottomTabNav from '@/layouts/BottomTabNav.vue'
</script>
