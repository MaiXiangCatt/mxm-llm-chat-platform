import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Settings } from './types'

const SETTING_KEY = 'chat-setting'

const defaultSettings: Settings = {
  model: 'deepseek-ai/DeepSeek-R1',
  apiKey: '',
  stream: false,
  temperature: 0.5,
}

export const useSettingStore = defineStore(
  'setting',
  () => {
    const savedSettings: Partial<Settings> = JSON.parse(localStorage.getItem(SETTING_KEY) || '{}')
    const settings = ref<Settings>({
      ...defaultSettings,
      ...savedSettings,
    })

    function updatesSettings(newSettings: Partial<Settings>) {
      Object.assign(settings.value, newSettings)
    }

    // watch(
    //   settings,
    //   (newSettigs) => {
    //     localStorage.setItem(SETTING_KEY, JSON.stringify(newSettigs))
    //   },
    //   { deep: true }
    // )

    return {
      settings,
      updatesSettings,
    }
  },
  { persist: true }
)
