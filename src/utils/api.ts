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
export async function fetchChatTitle(messages: RequestMessage[]) {
  const settingStore = useSettingStore()
  const userMessages = messages.map((m) => `${m.role}: ${m.content}}`).join('\n')
  const prompt = `请根据以下对话内容生成一个简短且概括的标题,不超过10个字,只返回标题本身。请勿添加任何前缀,请勿添加任何后缀,请勿添加任何标点符号,请勿添加任何特殊字符,请勿添加任何数字,请勿添加任何emoji,请勿添加任何图片，请勿添加任何链接，请勿添加任何特殊字符。 \n\n对话内容:${userMessages}`

  const payload = {
    model: settingStore.settings.model,
    messages: [{ role: 'user', content: prompt }],
    stream: false,
    temperature: 0.2,
  }

  try {
    const response = await service.post<ChatCompletionResponse>('/v1/chat/completions', payload)
    return response
  } catch (err) {
    console.error(err)
  }
}
