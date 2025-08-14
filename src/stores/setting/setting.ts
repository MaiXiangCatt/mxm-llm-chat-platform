import { defineStore } from 'pinia'
import { ref } from 'vue'
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
    const settings = ref<Settings>({
      ...defaultSettings,
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
