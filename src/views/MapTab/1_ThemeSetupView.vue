<template>
  <div class="flex flex-col h-full bg-gray-50 overflow-y-auto">
    <!-- 헤더 -->
    <div class="px-5 pt-6 pb-4">
      <h2 class="text-2xl font-bold text-gray-800">어떤 마실 떠날까요?</h2>
      <p class="text-sm text-gray-400 mt-1">테마를 선택하거나 직접 입력해보세요</p>
    </div>

    <!-- 추천 테마 카드 목록 -->
    <div class="px-5 mb-5">
      <p class="text-sm font-semibold text-gray-600 mb-3">추천 테마</p>
      <div class="grid grid-cols-2 gap-3">
        <ThemeCard
          v-for="theme in themes"
          :key="theme.id"
          :theme="theme"
          :selected="selectedTheme?.id === theme.id"
          @select="onThemeSelect"
        />
      </div>
    </div>

    <!-- AI 챗봇 입력 -->
    <div class="px-5 mb-6">
      <p class="text-sm font-semibold text-gray-600 mb-3">직접 입력</p>
      <AiChatPrompt @submit="onPromptSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ThemeCard from '@/components/ai/ThemeCard.vue'
import AiChatPrompt from '@/components/ai/AiChatPrompt.vue'
import { useRideStore } from '@/stores/useRideStore'

const router = useRouter()
const rideStore = useRideStore()

const selectedTheme = ref(null)

const themes = [
  {
    id: 1,
    title: '벚꽃 코스',
    desc: '봄꽃 가득한 30분 루트',
    image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&q=80'
  },
  {
    id: 2,
    title: '역사 탐방',
    desc: '궁궐·문화재 중심 코스',
    image: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&q=80'
  },
  {
    id: 3,
    title: '카페 투어',
    desc: '감성 카페 사이클링',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80'
  },
  {
    id: 4,
    title: '공원 힐링',
    desc: '녹지·공원 위주 힐링 코스',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80'
  }
]

function onThemeSelect(theme) {
  selectedTheme.value = theme
  rideStore.setPrompt(theme.desc)
  router.push('/map/preview')
}

function onPromptSubmit(text) {
  rideStore.setPrompt(text)
  router.push('/map/preview')
}
</script>
