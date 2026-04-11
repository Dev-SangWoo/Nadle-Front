<template>
  <BottomSheet @close="$emit('close')">

    <!-- QR 스캔 오버레이 -->
    <Transition name="fade-up">
      <div
        v-if="showQr"
        class="absolute inset-0 z-10 bg-white rounded-t-3xl flex flex-col items-center justify-between px-6 pt-8 pb-8"
      >
        <!-- 상단 닫기 -->
        <button
          class="absolute top-4 right-5 text-gray-400 text-2xl leading-none"
          @click="closeCamera"
        >✕</button>

        <div class="flex flex-col items-center gap-4 w-full">
          <h3 class="text-xl font-bold text-gray-900 text-center">QR 코드 스캔</h3>
          <p class="text-sm text-gray-500 text-center leading-relaxed">
            가게에서 QR 코드를 스캔해<br>
            <span class="font-semibold text-nadle-green">나들 라이딩 할인</span>을 받으세요!
          </p>

          <!-- 카메라 뷰 -->
          <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-black mb-4">
            <video
              ref="videoEl"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
            />
            <!-- 스캔 가이드 코너 -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="relative w-48 h-48">
                <span class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <span class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <span class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <span class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>
            <!-- 카메라 권한 거부 메시지 -->
            <div
              v-if="cameraError"
              class="absolute inset-0 flex items-center justify-center bg-gray-900/80 px-4"
            >
              <p class="text-white text-sm text-center leading-relaxed">{{ cameraError }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 카테고리 뱃지 + 이름 + 지도 버튼 -->
    <div class="flex items-start gap-3 mb-4">
      <span class="text-4xl flex-shrink-0">{{ place.emoji }}</span>
      <div class="flex-1 min-w-0">
        <span
          class="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-1"
          :class="categoryStyle.badge"
        >
          {{ categoryStyle.label }}
        </span>
        <h2 class="text-xl font-bold text-gray-900 leading-tight">{{ place.name }}</h2>
      </div>
      <!-- 지도에서 보기 (우측 상단) -->
      <a
        :href="kakaoMapUrl"
        target="_blank"
        rel="noopener"
        class="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-nadle-green bg-green-50 border border-green-200 px-3 py-1.5 rounded-full active:bg-green-100 transition-all"
      >
        🗺️ 지도
      </a>
    </div>

    <!-- 주소 -->
    <div class="flex items-start gap-2 mb-4 bg-gray-50 rounded-xl px-4 py-3">
      <span class="text-base flex-shrink-0 mt-0.5">📍</span>
      <p class="text-sm text-gray-600 leading-relaxed">{{ place.address }}</p>
    </div>

    <!-- 간단 설명 -->
    <p v-if="place.description" class="text-sm text-gray-700 leading-relaxed mb-6">
      {{ place.description }}
    </p>
    <p v-else-if="place.subCategory" class="text-sm text-gray-500 leading-relaxed mb-6">
      {{ place.subCategory }}
    </p>

    <!-- 할인받기 버튼 -->
    <button
      class="block w-full py-4 rounded-2xl text-base font-bold text-center bg-nadle-green text-white shadow-md active:scale-95 transition-all mb-3"
      @click="showQr = true"
    >
      🎁 주변 가게에서 할인받기
    </button>

    <!-- 닫기 -->
    <button
      class="block w-full py-3 rounded-2xl text-sm font-semibold text-gray-400 bg-gray-100 active:bg-gray-200 transition-all"
      @click="$emit('close')"
    >
      닫기
    </button>
  </BottomSheet>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { kakaoMapPlaceUrl } from '@/utils/kakaoMapLinks'

const props = defineProps({
  place: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const showQr = ref(false)
const videoEl = ref(null)
const cameraError = ref(null)
let stream = null

async function startCamera() {
  cameraError.value = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    await nextTick()
    if (videoEl.value) {
      videoEl.value.srcObject = stream
    }
  } catch {
    cameraError.value = '카메라 권한이 필요해요.\n설정에서 카메라 접근을 허용해주세요.'
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
}

function closeCamera() {
  stopCamera()
  showQr.value = false
}

watch(showQr, (val) => {
  if (val) startCamera()
  else stopCamera()
})

const CATEGORY_MAP = {
  cafe:        { label: '카페',    badge: 'bg-amber-100 text-amber-700' },
  restaurant:  { label: '식당',    badge: 'bg-orange-100 text-orange-700' },
  bakery:      { label: '베이커리', badge: 'bg-yellow-100 text-yellow-700' },
  bar:         { label: '바·주점', badge: 'bg-purple-100 text-purple-700' },
  shopping:    { label: '쇼핑',    badge: 'bg-pink-100 text-pink-700' },
  attraction:  { label: '명소',    badge: 'bg-blue-100 text-blue-700' },
}

const DEFAULT_CATEGORY = { label: '상권', badge: 'bg-gray-100 text-gray-600' }

const categoryStyle = computed(() => CATEGORY_MAP[props.place?.category] ?? DEFAULT_CATEGORY)

const kakaoMapUrl = computed(() => {
  const { name, lat, lng } = props.place
  const pLat = Number(lat)
  const pLng = Number(lng)
  if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) {
    return `https://map.kakao.com/link/search/${encodeURIComponent(name)}`
  }
  return kakaoMapPlaceUrl(name, pLat, pLng)
})
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
