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
    const contentQueue: string[] = []
    let accumulatedContent = ''
    let accumulatedReasoningContent = ''
    let isStreamDone = false
    let renderTimer: number | null = null

    const render = () => {
      if (contentQueue.length === 0 && isStreamDone) {
        if (renderTimer) clearInterval(renderTimer)
        updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
        return
      }
      let chunkSize = 1
      console.log('当前渲染队列长度为:', contentQueue.length)
      if (contentQueue.length > 100) {
        chunkSize = 10
      } else if (contentQueue.length > 10) {
        chunkSize = 3
      }
      const charsToRender = contentQueue.splice(0, chunkSize).join('')
      accumulatedContent += charsToRender
      updateCallback(accumulatedContent, 0, accumulatedReasoningContent)
    }
    renderTimer = setInterval(render, 16)

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          isStreamDone = true
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          if (line === 'data: [DONE]') continue
          if (line.startsWith('data: ')) {
            const parsedData = JSON.parse(line.substring(6))
            const content = parsedData.choices[0].delta.content || ''
            const reasoningContent = parsedData.choices[0].delta.reasoning_content || ''

            if (content) {
              contentQueue.push(...content.split(''))
            }
            if (reasoningContent) {
              accumulatedReasoningContent += reasoningContent
            }
          }
        }
      }
    } finally {
      isStreamDone = true
    }
  },

  // 渐显
  // async handleStreamResponse(response: Response, updateCallback: UpdateCallback) {
  //   const reader = response.body!.getReader()
  //   if (!reader) throw new Error('reader is null')

  //   const decoder = new TextDecoder()
  //   let accumulatedContent = ''
  //   let accumulatedReasoningContent = ''
  //   const contentQueue: string[] = []
  //   const reasoningQueue: string[] = []
  //   let animationFrameId: number | null = null
  //   let chunkKey = 0
  //   let reasoningChunkKey = 0

  //   const render = () => {
  //     if (!contentQueue.length && !reasoningQueue.length) {
  //       animationFrameId = null
  //       return
  //     }
  //     let currentChunkContent = ''
  //     let reasoningChunkContent = ''

  //     if (reasoningQueue.length) {
  //       reasoningChunkContent = reasoningQueue.shift()!
  //       accumulatedReasoningContent += reasoningChunkContent
  //     }
  //     if (contentQueue.length) {
  //       currentChunkContent = contentQueue.shift()!
  //       accumulatedContent += currentChunkContent
  //     }
  //     const chunk: ContentChunk = {
  //       content: currentChunkContent,
  //       key: chunkKey++,
  //     }
  //     const reasoningChunk: ContentChunk = {
  //       content: reasoningChunkContent,
  //       key: reasoningChunkKey++,
  //     }
  //     updateCallback(
  //       accumulatedContent,
  //       0,
  //       accumulatedReasoningContent,
  //       chunk,
  //       reasoningChunk,
  //       false
  //     )
  //     animationFrameId = requestAnimationFrame(render)
  //   }

  //   const ensureRendering = () => {
  //     if (animationFrameId === null) animationFrameId = requestAnimationFrame(render)
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
  //           const parsedData = JSON.parse(line.slice(6))
  //           const content = parsedData.choices[0].delta.content || ''
  //           const reasoning_content = parsedData.choices[0].delta.reasoning_content || ''

  //           if (content) {
  //             contentQueue.push(...content.split(''))
  //           }
  //           if (reasoning_content) {
  //             reasoningQueue.push(...reasoning_content.split(''))
  //           }
  //           ensureRendering()
  //         }
  //       }
  //     }
  //   } finally {
  //     if (animationFrameId) {
  //       cancelAnimationFrame(animationFrameId)
  //     }
  //     updateCallback(accumulatedContent, 0, accumulatedReasoningContent, void 0, void 0, true)
  //   }
  // },
  async handleResponse(response: any, isStream: boolean, updateCallback: UpdateCallback) {
    if (isStream) {
      await this.handleStreamResponse(response, updateCallback)
    } else {
      this.handleUnstreamResponse(response, updateCallback)
    }
  },
}
