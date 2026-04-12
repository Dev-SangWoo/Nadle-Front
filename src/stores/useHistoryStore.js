import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  const records = ref([])
  const totalStamps = ref([])

  function addRecord(record) {
    if (record.id && records.value.some(r => r.id === record.id)) return

    records.value.unshift({
      id: record.id ?? Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      ...record
    })
    totalStamps.value.push(...(record.stamps ?? []))
  }

  return {
    records,
    totalStamps,
    addRecord
  }
})
