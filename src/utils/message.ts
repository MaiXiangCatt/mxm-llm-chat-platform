import type { Role, Message, ChatCompletionResponse, UpdateCallback } from '@/stores/chats/types'

export const messageHandler = {
  formatMessage(role: Role, content: string, reasoning_content?: string): Message {
    return {
      id: Date.now(),
      role,
      content,
      reasoning_content,
    }
  },

  handleUnstreamResponse(response: ChatCompletionResponse, updateCallback: UpdateCallback) {
    updateCallback(
      response.choices[0].message.content,
      response.usage.completion_tokens,
      response.choices[0].message.reasoning_content
    )
  },

  async handleStreamResponse(response: Response, updateCallback: UpdateCallback) {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is null!')
    }

    const decoder = new TextDecoder()
    let accumulatedContent = ''
    let accumulatedReasoningContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter((line) => line.trim() !== '')

      for (const line of lines) {
        if (line === 'data: [DONE]') continue
        if (line.startsWith('data: ')) {
          const parsedData = JSON.parse(line.substring(6))
          const content = parsedData.choices[0].delta.content || ''
          const reasoning_content = parsedData.choices[0].delta.reasoning_content || ''

          accumulatedContent += content
          accumulatedReasoningContent += reasoning_content

          updateCallback(
            accumulatedContent,
            parsedData.usage.completion_tokens,
            accumulatedReasoningContent
          )
        }
      }
    }
  },
  async handleResponse(response: any, isStream: boolean, updateCallback: UpdateCallback) {
    if (isStream) {
      await this.handleStreamResponse(response, updateCallback)
    } else {
      this.handleUnstreamResponse(response, updateCallback)
    }
  },
}
