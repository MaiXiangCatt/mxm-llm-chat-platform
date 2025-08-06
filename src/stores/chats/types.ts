export type Role = 'user' | 'assistant'

export interface Message {
  id: number
  role: Role
  content: string
  reasoning_content?: string
  completion_tokens?: number
}

export interface RequestMessage {
  role: Role
  content: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
}

interface ToolCallFunction {
  name: string
  arguments: string
}

interface ToolCall {
  id: string
  type: 'function'
  function: ToolCallFunction
}

// 返回消息体的类型定义
export interface ResponseMessage extends Message {
  tool_calls?: ToolCall[]
}

interface Choice {
  message: ResponseMessage
  finish_reason: 'stop' | 'length' | 'function_call' | null
}

interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface ChatCompletionResponse {
  id: string
  choices: Choice[]
  usage: Usage
  created: number
  model: string
  object: 'chat.completion'
  speed?: string
}

export type UpdateCallback = (content: string, tokens: number, reasoning_content?: string) => void
