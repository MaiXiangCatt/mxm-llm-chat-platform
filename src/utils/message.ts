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
}
