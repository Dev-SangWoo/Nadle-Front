<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center"
      @click.self="onClose"
    >
      <div
        class="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl overflow-hidden"
        style="max-height: 72vh; overflow-y: auto;"
        @click.stop
      >
        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

        <div v-if="loading" class="py-8 text-center text-sm text-gray-500">
          대여소 정보를 불러오는 중…
        </div>
        <div v-else-if="error" class="py-6 text-center">
          <p class="text-sm text-red-600 mb-3">{{ error }}</p>
          <button
            type="button"
            class="text-nadle-green font-semibold underline text-sm"
            @click="load"
          >
            다시 시도
          </button>
        </div>
        <template v-else-if="detail">
          <div class="flex items-start justify-between gap-2 mb-4">
            <div class="min-w-0 flex-1">
              <h2 class="text-xl font-bold text-gray-900 leading-tight">
                {{ detail.stationName }}
              </h2>
              <span
                class="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
                :class="statusBadgeClass"
              >
                {{ statusLabel }}
              </span>
            </div>
            <a
              :href="mapUrl"
              target="_blank"
              rel="noopener"
              class="flex-shrink-0 text-xs font-semibold text-nadle-green bg-green-50 border border-green-200 px-3 py-1.5 rounded-full"
            >
              🗺️ 지도
            </a>
          </div>

          <div class="flex items-start gap-2 mb-4 bg-gray-50 rounded-xl px-4 py-3">
            <span class="text-base flex-shrink-0">📍</span>
            <p class="text-sm text-gray-600 leading-relaxed">{{ detail.address }}</p>
          </div>

          <ul class="text-sm text-gray-700 space-y-2.5 mb-6">
            <li v-if="detail.totalSlots != null">
              <span class="text-gray-500">총 거치대</span>
              <span class="font-semibold ml-2">{{ detail.totalSlots }}개</span>
            </li>
            <li v-if="detail.availableBikes != null">
              <span class="text-gray-500">대여 가능</span>
              <span class="font-semibold ml-2">{{ detail.availableBikes }}대</span>
            </li>
            <li v-if="detail.emptySlots != null">
              <span class="text-gray-500">빈 거치대</span>
              <span class="font-semibold ml-2">{{ detail.emptySlots }}칸</span>
            </li>
            <li>
              <span class="text-gray-500">운영 시간</span>
              <span class="font-semibold ml-2">{{ detail.operatingHours }}</span>
            </li>
          </ul>

          <button
            type="button"
            class="block w-full py-3 rounded-2xl text-sm font-semibold text-gray-500 bg-gray-100 active:bg-gray-200 transition-colors"
            @click="onClose"
          >
            닫기
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { fetchStationDetail } from '@/api/stations'
import { kakaoMapPlaceUrl } from '@/utils/kakaoMapLinks'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** 대여소 고유 ID */
  stationId: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref('')
const detail = ref(null)

const mapUrl = computed(() => {
  if (!detail.value) return '#'
  return kakaoMapPlaceUrl(
    detail.value.stationName,
    detail.value.lat,
    detail.value.lng
  )
})

const statusLabel = computed(() => {
  const s = detail.value?.status
  if (s === 'ACTIVE') return '운영 중'
  if (s === 'INACTIVE') return '운영 중지'
  return s || '—'
})

const statusBadgeClass = computed(() =>
  detail.value?.status === 'ACTIVE'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-200 text-gray-600'
)

function onClose() {
  emit('close')
}

async function load() {
  const id = props.stationId != null ? String(props.stationId).trim() : ''
  if (!id) return
  loading.value = true
  error.value = ''
  detail.value = null
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 15000)
  try {
    detail.value = await fetchStationDetail(id, { signal: ac.signal })
  } catch (e) {
    error.value = e?.message || '불러오지 못했습니다.'
    detail.value = null
  } finally {
    clearTimeout(timer)
    loading.value = false
  }
}

watch(
  () => [props.open, props.stationId],
  ([isOpen, id]) => {
    if (isOpen && String(id ?? '').trim()) {
      load()
    } else if (!isOpen) {
      detail.value = null
      error.value = ''
    }
  },
  { immediate: true }
)
</script>
