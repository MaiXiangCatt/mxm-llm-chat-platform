import service from './request'
import { useSettingStore } from '@/stores/setting/setting'
import type { ChatCompletionResponse, RequestMessage } from '@/stores/chats/types'

export async function fetchChatCompletion(messages: RequestMessage[]) {
  const settingStore = useSettingStore()
  const payload = {
    model: settingStore.settings.model,
    messages,
    stream: settingStore.settings.stream,
    temperature: settingStore.settings.temperature,
  }

  try {
    const startTime = Date.now()
    const response = await service.post<ChatCompletionResponse>('/v1/chat/completions', payload)
    console.log('开始请求')

    const duration = (Date.now() - startTime) / 1000
    if (response.usage && response.usage.completion_tokens) {
      response.speed = (response.usage.completion_tokens / duration).toFixed(2)
    }
    return response
  } catch (error) {
    console.error('Chatapi Error:', error)
    throw error
  }
}

export async function fetchChatCompletionStream(messages: RequestMessage[]) {
  const settingStore = useSettingStore()
  const payload = {
    model: settingStore.settings.model,
    messages,
    stream: settingStore.settings.stream,
    temperature: settingStore.settings.temperature,
  }
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settingStore.settings.apiKey}`,
    },
    body: JSON.stringify(payload),
  }

  try {
    const response = await fetch('/api/v1/chat/completions', config)
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }
    return response
  } catch (error) {
    console.error('Chatapi Error:', error)
    throw error
  }
}
