<template>
  <!-- 실제 마커는 카카오맵 SDK로 렌더링 -->
  <!-- 이 컴포넌트는 마커 데이터를 부모에서 받아 SDK에 주입하는 용도 -->
  <slot />
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  map: { type: Object, default: null },
  position: { type: Object, required: true }, // { lat, lng }
  type: { type: String, default: 'station' },  // 'station' | 'destination' | 'current'
  label: { type: String, default: '' }
})

const emit = defineEmits(['click'])

let marker = null

watch(() => props.map, (map) => {
  if (!map || !window.kakao) return
  // TODO: 카카오맵 마커 생성 및 이벤트 등록
  // const pos = new kakao.maps.LatLng(props.position.lat, props.position.lng)
  // marker = new kakao.maps.Marker({ map, position: pos })
  // kakao.maps.event.addListener(marker, 'click', () => emit('click'))
}, { immediate: true })
</script>
