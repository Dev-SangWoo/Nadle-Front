import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchRouteRecommendDestinations } from '@/api/routes'
import { fetchRandomNearbyDestinations } from '@/api/spots'
import { useLocationStore } from '@/stores/useLocationStore'

const FALLBACK_LAT = 37.5665
const FALLBACK_LNG = 126.978

export const useRideStore = defineStore('ride', () => {
  const prompt = ref('')

  const selectedStation = ref(null)

  const destinations = ref([])

  const destinationsLoading = ref(false)

  const destinationsError = ref(null)

  /** AI 추천 실패 후 주변 랜덤(TOUR)으로 대체했을 때 true */
  const recommendFallback = ref(false)

  const currentDestIndex = ref(0)

  const stamps = ref([])

  const isRiding = ref(false)

  function setPrompt(text) {
    prompt.value = text
  }

  /**
   * 대여소·GPS·폴백 순으로 기준 좌표 결정 (추천 API stationLat/Lng)
   */
  async function resolveStationCoords(opts, locationStore) {
    const oLat = opts.stationLat
    const oLng = opts.stationLng
    if (
      oLat != null &&
      oLng != null &&
      Number.isFinite(Number(oLat)) &&
      Number.isFinite(Number(oLng))
    ) {
      return { lat: Number(oLat), lng: Number(oLng) }
    }

    const st = selectedStation.value
    if (
      st?.lat != null &&
      st?.lng != null &&
      Number.isFinite(Number(st.lat)) &&
      Number.isFinite(Number(st.lng))
    ) {
      return { lat: Number(st.lat), lng: Number(st.lng) }
    }

    const ready = await locationStore.waitForCoords(18000)
    if (ready) {
      return { lat: ready.lat, lng: ready.lng }
    }

    const fl = locationStore.lat
    const fg = locationStore.lng
    return {
      lat:
        fl != null && Number.isFinite(Number(fl)) ? Number(fl) : FALLBACK_LAT,
      lng:
        fg != null && Number.isFinite(Number(fg)) ? Number(fg) : FALLBACK_LNG
    }
  }

  /**
   * GET /api/v1/routes/recommend — AI 코스 추천
   * 실패·빈 응답 시 주변 TOUR 랜덤 3곳으로 폴백
   *
   * @param {object} [opts]
   * @param {number} [opts.stationLat]
   * @param {number} [opts.stationLng]
   * @param {number} [opts.duration=120] 예상 시간(분)
   * @param {string} [opts.refinement] 채팅 조정 문구 (테마 프롬프트와 함께 전달)
   */
  async function loadRouteRecommendations(opts = {}) {
    destinationsLoading.value = true
    destinationsError.value = null
    recommendFallback.value = false

    const locationStore = useLocationStore()
    const durationRaw = opts.duration != null ? Number(opts.duration) : 120
    const duration =
      Number.isFinite(durationRaw) && durationRaw > 0
        ? Math.floor(durationRaw)
        : 120

    let stationLat = FALLBACK_LAT
    let stationLng = FALLBACK_LNG

    try {
      const coords = await resolveStationCoords(opts, locationStore)
      stationLat = coords.lat
      stationLng = coords.lng

      const themeText = prompt.value?.trim() || ''
      const refinement = opts.refinement?.trim() || ''
      const combinedPrompt = refinement
        ? themeText
          ? `${themeText}\n\n조정 요청: ${refinement}`
          : refinement
        : themeText || undefined

      const list = await fetchRouteRecommendDestinations({
        stationLat,
        stationLng,
        duration,
        prompt: combinedPrompt
      })

      if (list.length > 0) {
        setDestinations(list)
        return
      }

      throw new Error('추천된 관광지가 없습니다.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      try {
        const fallback = await fetchRandomNearbyDestinations(
          stationLat,
          stationLng,
          {
            count: 3,
            radiusM: 2000,
            poolSize: 50,
            category: 'TOUR'
          }
        )
        setDestinations(fallback)
        if (fallback.length > 0) {
          recommendFallback.value = true
          destinationsError.value = null
        } else {
          destinationsError.value =
            msg ||
            '코스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
        }
      } catch {
        destinationsError.value =
          msg || '코스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
        setDestinations([])
      }
    } finally {
      destinationsLoading.value = false
    }
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
    destinationsLoading.value = false
    destinationsError.value = null
    recommendFallback.value = false
    currentDestIndex.value = 0
    stamps.value = []
    isRiding.value = false
  }

  return {
    prompt,
    selectedStation,
    destinations,
    destinationsLoading,
    destinationsError,
    recommendFallback,
    currentDestIndex,
    stamps,
    isRiding,
    setPrompt,
    setStation,
    setDestinations,
    loadRouteRecommendations,
    startRide,
    collectStamp,
    finishRide,
    resetRide
  }
})
