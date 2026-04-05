<template>
  <div class="flex flex-col items-center gap-5">
    <!-- 문제 -->
    <div class="w-full bg-gray-50 rounded-2xl p-4 text-center">
      <p class="text-sm text-gray-500 mb-2">관광지 퀴즈</p>
      <p class="text-base font-semibold text-gray-800 leading-relaxed">{{ question.text }}</p>
    </div>

    <!-- 정답/오답 피드백 -->
    <div v-if="answered" class="text-center">
      <p class="text-4xl mb-2">{{ isCorrect ? '🎉' : '😅' }}</p>
      <p class="font-semibold" :class="isCorrect ? 'text-nadle-green' : 'text-red-500'">
        {{ isCorrect ? '정답이에요!' : '아쉽지만 틀렸어요' }}
      </p>
      <p class="text-sm text-gray-500 mt-1">{{ question.explanation }}</p>
    </div>

    <!-- O / X 버튼 -->
    <div v-if="!answered" class="flex gap-4 w-full">
      <button
        @click="selectAnswer(true)"
        class="flex-1 py-5 rounded-2xl bg-blue-50 text-5xl font-bold text-blue-500 active:scale-95 transition-transform"
      >
        O
      </button>
      <button
        @click="selectAnswer(false)"
        class="flex-1 py-5 rounded-2xl bg-red-50 text-5xl font-bold text-red-500 active:scale-95 transition-transform"
      >
        X
      </button>
    </div>

    <!-- 완료 버튼 -->
    <button
      v-if="answered"
      @click="$emit('complete')"
      class="w-full py-4 bg-nadle-green text-white rounded-2xl font-bold text-base"
    >
      스탬프 받기 🏅
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['complete'])

// TODO: AI 또는 API에서 관광지 퀴즈 가져오기
const question = ref({
  text: '경복궁은 조선시대 가장 먼저 세워진 궁궐이다.',
  answer: true,
  explanation: '경복궁은 1395년 태조 이성계가 조선 건국 후 처음으로 세운 법궁입니다.'
})

const answered = ref(false)
const isCorrect = ref(false)

function selectAnswer(choice) {
  answered.value = true
  isCorrect.value = choice === question.value.answer
}
</script>
