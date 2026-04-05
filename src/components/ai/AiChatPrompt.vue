<template>
  <div class="flex flex-col gap-3">
    <!-- 채팅 히스토리 (메시지가 있을 때만 표시) -->
    <div v-if="messages.length" class="flex flex-col gap-2 max-h-48 overflow-y-auto">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="px-4 py-2 rounded-2xl text-sm max-w-[80%]"
          :class="msg.role === 'user'
            ? 'bg-nadle-green text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-700 rounded-bl-sm'"
        >
          {{ msg.content }}
        </div>
      </div>
    </div>

    <!-- 입력창 -->
    <div class="flex gap-2 items-end">
      <textarea
        v-model="inputText"
        :placeholder="placeholder || '예: 벚꽃 볼 수 있는 30분짜리 코스 추천해줘'"
        rows="2"
        class="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-nadle-green transition-colors"
        @keydown.enter.prevent="onSubmit"
      />
      <button
        @click="onSubmit"
        :disabled="!inputText.trim()"
        class="flex-shrink-0 w-12 h-12 rounded-2xl bg-nadle-green text-white flex items-center justify-center text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-95"
      >
        ↑
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['submit'])

const inputText = ref('')
const messages = ref([])

function onSubmit() {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  emit('submit', text)
  inputText.value = ''

  // TODO: AI 응답 처리 후 messages에 assistant 응답 추가
}
</script>
