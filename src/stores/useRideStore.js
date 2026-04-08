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
      {
        spotId: '126508',
        spotName: '경복궁',
        description: '조선 왕조의 법궁으로, 1395년에 창건되었습니다. 근정전, 경회루 등 수려한 전각이 어우러져 한국 전통 건축미의 정수를 보여줍니다. 수문장 교대식 등 다양한 전통 공연도 즐길 수 있어요.',
        category: 'CULTURE',
        address: '서울특별시 종로구 사직로 161',
        lat: 37.579617,
        lng: 126.977041,
        images: [
          'https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=800&q=80',
          'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=800&q=80'
        ],
        tel: '02-3700-3900'
      },
      {
        spotId: '264570',
        spotName: '인사동',
        description: '전통 공예품과 갤러리, 찻집이 가득한 서울의 대표 문화 거리입니다. 주말 차 없는 거리로 운영되며, 한복을 입고 거닐기 좋은 분위기가 매력입니다.',
        category: 'TOUR',
        address: '서울특별시 종로구 인사동길 일대',
        lat: 37.5742,
        lng: 126.9847,
        images: [
          'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80'
        ],
        tel: null
      },
      {
        spotId: '797997',
        spotName: '청계천',
        description: '서울 도심을 가로지르는 약 5.8km의 복원 하천입니다. 계절마다 다양한 꽃과 조명 축제가 열리며, 자전거 산책로와 함께 힐링 코스로 인기가 높습니다.',
        category: 'NATURE',
        address: '서울특별시 종로구 청계천로 일대',
        lat: 37.5696,
        lng: 126.9790,
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
          'https://images.unsplash.com/photo-1601621915196-2621bfb0cd6e?w=800&q=80',
          'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80'
        ],
        tel: '02-2290-7111'
      }
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
