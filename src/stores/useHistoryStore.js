import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  // 전체 여행 기록
  const records = ref([])

  // 전체 스탬프 수
  const totalStamps = ref([])

  function addRecord(record) {
    records.value.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      ...record
    })
    totalStamps.value.push(...record.stamps)
  }

  return {
    records,
    totalStamps,
    addRecord
  }
})
