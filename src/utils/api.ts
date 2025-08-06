import service from './request'
import { useSettingStore } from '@/stores/setting/setting'
import type { ChatCompletionResponse, RequestMessage } from '@/stores/chats/types'

const BASE_URL = 'https://api.siliconflow.cn/v1'

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
    const response = await service.post<ChatCompletionResponse>(
      `${BASE_URL}/chat/completions`,
      payload
    )
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
