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

  // async handleStreamResponse(response: Response, updateCallback: UpdateCallback) {
  //   const reader = response.body?.getReader()
  //   if (!reader) {
  //     throw new Error('Response body is null!')
  //   }

  //   const decoder = new TextDecoder()
  //   let accumulatedContent = ''
  //   let accumulatedReasoningContent = ''
  //   const contentQueue: string[] = []

  //   const intervalId = setInterval(() => {
  //     if (contentQueue.length === 0) return
  //     const batch = contentQueue.splice(0)
  //     accumulatedContent += batch.join('')
  //     updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
  //   }, 20)

  //   try {
  //     while (true) {
  //       const { done, value } = await reader.read()
  //       if (done) break

  //       const chunk = decoder.decode(value, { stream: true })
  //       const lines = chunk.split('\n').filter((line) => line.trim() !== '')

  //       for (const line of lines) {
  //         if (line === 'data: [DONE]') continue
  //         if (line.startsWith('data: ')) {
  //           const parsedData = JSON.parse(line.substring(6))
  //           const content = parsedData.choices[0].delta.content || ''
  //           const reasoning_content = parsedData.choices[0].delta.reasoning_content || ''

  //           if (content) {
  //             contentQueue.push(...content.split(''))
  //           }

  //           accumulatedReasoningContent += reasoning_content
  //         }
  //       }
  //     }
  //   } finally {
  //     clearInterval(intervalId)
  //     if (contentQueue.length > 0) {
  //       accumulatedContent += contentQueue.join('')
  //       updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
  //     }
  //   }
  // },

  async handleStreamResponse(response: Response, updateCallback: UpdateCallback) {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is null!')
    }

    const decoder = new TextDecoder()
    let accumulatedContent = ''
    const contentQueue: string[] = []
    let isRendering = false
    let animationFrameId: number | null = null

    const render = () => {
      if (contentQueue.length === 0) {
        isRendering = false
        return
      }
      isRendering = true
      const batch = contentQueue.shift()
      accumulatedContent += batch
      updateCallback(accumulatedContent, 0)

      animationFrameId = requestAnimationFrame(render)
    }

    try {
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

            if (content) {
              contentQueue.push(...content.split(''))
              !isRendering && render()
            }
          }
        }
      }
    } finally {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (contentQueue.length > 0) {
        accumulatedContent += contentQueue.join('')
        updateCallback(accumulatedContent, 0, '')
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
