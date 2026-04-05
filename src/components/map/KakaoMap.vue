<template>
  <div ref="mapContainer" class="w-full h-full bg-gray-100" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: 37.5665, lng: 126.9780 })
  },
  level: { type: Number, default: 4 }
})

const mapContainer = ref(null)

onMounted(() => {
  // TODO: 카카오 지도 SDK 초기화
  // window.kakao.maps.load(() => {
  //   const options = { center: new kakao.maps.LatLng(props.center.lat, props.center.lng), level: props.level }
  //   const map = new kakao.maps.Map(mapContainer.value, options)
  // })
})

defineExpose({ mapContainer })
</script>
