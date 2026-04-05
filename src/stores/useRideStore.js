import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRideStore = defineStore('ride', () => {
  // AI 프롬프트 (테마 or 자유입력)
  const prompt = ref('')

  // 선택된 대여소
  const selectedStation = ref(null)

  // AI 추천 목적지 목록
  const destinations = ref([])

  // 현재 목적지 인덱스
  const currentDestIndex = ref(0)

  // 획득한 스탬프
  const stamps = ref([])

  // 주행 상태
  const isRiding = ref(false)

  function setPrompt(text) {
    prompt.value = text
    // TODO: AI API 호출 → destinations 업데이트
    destinations.value = [
      { name: '경복궁', description: '조선시대 법궁', lat: 37.5796, lng: 126.9770 },
      { name: '인사동', description: '전통 문화 거리', lat: 37.5742, lng: 126.9847 },
      { name: '청계천', description: '도심 속 하천', lat: 37.5696, lng: 126.9790 }
    ]
  }

  function setStation(station) {
    selectedStation.value = station
  }

  function setDestinations(dests) {
    destinations.value = dests
    currentDestIndex.value = 0
  }

  function startRide() {
    isRiding.value = true
  }

  function collectStamp(destName) {
    stamps.value.push({
      name: destName,
      acquiredAt: new Date().toISOString()
    })
    currentDestIndex.value++
  }

  function finishRide() {
    isRiding.value = false
  }

  function resetRide() {
    prompt.value = ''
    selectedStation.value = null
    destinations.value = []
    currentDestIndex.value = 0
    stamps.value = []
    isRiding.value = false
  }

  return {
    prompt,
    selectedStation,
    destinations,
    currentDestIndex,
    stamps,
    isRiding,
    setPrompt,
    setStation,
    setDestinations,
    startRide,
    collectStamp,
    finishRide,
    resetRide
  }
})
