<template>
  <div class="flex flex-col items-center gap-5">
    <!-- 카메라 미션 안내 -->
    <div class="w-full bg-gray-50 rounded-2xl p-4 text-center">
      <p class="text-sm text-gray-500 mb-2">사진 인증 미션</p>
      <p class="text-base font-semibold text-gray-800">이 장소에서 사진을 찍어주세요!</p>
    </div>

    <!-- 카메라 미리보기 / 촬영 결과 -->
    <div class="w-full aspect-square bg-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
      <img v-if="capturedImage" :src="capturedImage" class="w-full h-full object-cover" alt="촬영 사진" />
      <div v-else class="flex flex-col items-center text-gray-400">
        <span class="text-5xl mb-2">📷</span>
        <p class="text-sm">촬영 버튼을 눌러주세요</p>
      </div>
    </div>

    <!-- 촬영 / 완료 버튼 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="onCapture"
    />

    <button
      v-if="!capturedImage"
      @click="$refs.fileInput.click()"
      class="w-full py-4 bg-gray-800 text-white rounded-2xl font-bold text-base"
    >
      📷 사진 촬영
    </button>

    <button
      v-else
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

const capturedImage = ref(null)
const fileInput = ref(null)

function onCapture(event) {
  const file = event.target.files[0]
  if (file) {
    capturedImage.value = URL.createObjectURL(file)
  }
}
</script>
