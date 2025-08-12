import type {
  Role,
  Message,
  ChatCompletionResponse,
  UpdateCallback,
  ContentChunk,
} from '@/stores/chats/types'

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
  //   const reasoningQueue: string[] = []
  //   let typingTimer: number | null = null

  //   function startTypingTimer() {
  //     if (typingTimer) return
  //     typingTimer = window.setInterval(() => {
  //       if (reasoningQueue.length) {
  //         accumulatedReasoningContent += reasoningQueue.shift()
  //       }
  //       if (contentQueue.length) {
  //         accumulatedContent += contentQueue.shift()
  //       }
  //       updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
  //       if (!reasoningQueue.length && !contentQueue.length) {
  //         clearInterval(typingTimer!)
  //         typingTimer = null
  //       }
  //     }, 18)
  //   }

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

  //           if (reasoning_content) {
  //             reasoningQueue.push(...reasoning_content.split(''))
  //             startTypingTimer()
  //           }
  //           if (content) {
  //             contentQueue.push(...content.split(''))
  //             startTypingTimer()
  //           }
  //         }
  //       }
  //     }
  //   } finally {
  //     if (typingTimer) {
  //       clearInterval(typingTimer)
  //       typingTimer = null
  //     }
  //     if (contentQueue.length || reasoningQueue.length) {
  //       accumulatedReasoningContent += reasoningQueue.join('')
  //       accumulatedContent += contentQueue.join('')
  //       updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
  //     }
  //   }
  // },

  // rAF方案
  // async handleStreamResponse(response: Response, updateCallback: UpdateCallback) {
  //   const reader = response.body?.getReader()
  //   if (!reader) {
  //     throw new Error('Response body is null!')
  //   }

  //   const decoder = new TextDecoder()
  //   let accumulatedContent = ''
  //   let accumulatedReasoningContent = ''
  //   const contentQueue: string[] = []
  //   const reasoningQueue: string[] = []
  //   let animationFrameId: number | null = null

  //   let lastTime = 0
  //   const RENDERSPEED = 16
  //   const render = (timeStamp: number) => {
  //     if (contentQueue.length === 0 && reasoningQueue.length === 0) {
  //       animationFrameId = null
  //       return
  //     }
  //     if (timeStamp - lastTime >= RENDERSPEED) {
  //       if (reasoningQueue.length > 0) {
  //         accumulatedReasoningContent += reasoningQueue.shift()
  //       }
  //       if (contentQueue.length > 0) {
  //         accumulatedContent += contentQueue.shift()
  //       }
  //       updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
  //       lastTime = timeStamp
  //     }

  //     animationFrameId = requestAnimationFrame(render)
  //   }

  //   const ensureRendering = () => {
  //     if (animationFrameId === null) {
  //       animationFrameId = requestAnimationFrame(render)
  //     }
  //   }

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
  //           const reasoningContent = parsedData.choices[0].delta.reasoning_content || ''

  //           if (content) {
  //             contentQueue.push(...content.split(''))
  //           }
  //           if (reasoningContent) {
  //             reasoningQueue.push(...reasoningContent.split(''))
  //           }
  //           ensureRendering()
  //         }
  //       }
  //     }
  //   } finally {
  //     if (animationFrameId) {
  //       cancelAnimationFrame(animationFrameId)
  //     }
  //     if (contentQueue.length > 0 || reasoningQueue.length > 0) {
  //       accumulatedContent += contentQueue.join('')
  //       accumulatedReasoningContent += reasoningQueue.join('')
  //       updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
  //     }
  //   }
  // },

  //渐显
  async handleStreamResponse(response: Response, updateCallback: UpdateCallback) {
    const reader = response.body!.getReader()
    if (!reader) throw new Error('reader is null')

    const decoder = new TextDecoder()
    let accumulatedContent = ''
    let accumulatedReasoningContent = ''
    const contentQueue: string[] = []
    const reasoningQueue: string[] = []
    let animationFrameId: number | null = null
    let chunkKey = 0
    let reasoningChunkKey = 0

    const render = () => {
      if (!contentQueue.length && !reasoningQueue.length) {
        animationFrameId = null
        return
      }
      let currentChunkContent = ''
      let reasoningChunkContent = ''

      if (reasoningQueue.length) {
        reasoningChunkContent = reasoningQueue.shift()!
        accumulatedReasoningContent += reasoningChunkContent
      }
      if (contentQueue.length) {
        currentChunkContent = contentQueue.shift()!
        accumulatedContent += currentChunkContent
      }
      const chunk: ContentChunk = {
        content: currentChunkContent,
        key: chunkKey++,
      }
      const reasoningChunk: ContentChunk = {
        content: reasoningChunkContent,
        key: reasoningChunkKey++,
      }
      updateCallback(
        accumulatedContent,
        0,
        accumulatedReasoningContent,
        chunk,
        reasoningChunk,
        false
      )
      animationFrameId = requestAnimationFrame(render)
    }

    const ensureRendering = () => {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(render)
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
            const parsedData = JSON.parse(line.slice(6))
            const content = parsedData.choices[0].delta.content || ''
            const reasoning_content = parsedData.choices[0].delta.reasoning_content || ''

            if (content) {
              contentQueue.push(...content.split(''))
            }
            if (reasoning_content) {
              reasoningQueue.push(...reasoning_content.split(''))
            }
            ensureRendering()
          }
        }
      }
    } finally {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      updateCallback(accumulatedContent, 0, accumulatedReasoningContent, void 0, void 0, true)
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
