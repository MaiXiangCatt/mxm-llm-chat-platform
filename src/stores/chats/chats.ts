import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  addId,
  messageHandler,
  fetchChatCompletion,
  fetchChatCompletionStream,
  fetchChatTitle,
} from '@/utils'
import { useSettingStore } from '../setting/setting'
import type { Chat, Message } from './types'

export const useChatsStore = defineStore(
  'chat',
  () => {
    // const chats = ref<Chat[]>([])
    const chatMap = ref(new Map<string, Chat>())
    const chatOrder = ref<string[]>([])
    const activeChatId = ref<string | null>(null)
    const isLoading = ref(false)

    // function getActiveChat() {
    //   return chats.value.find((chat) => chat.id === activeChatId.value)
    // }
    const activeChat = computed(() => {
      return activeChatId.value ? chatMap.value.get(activeChatId.value) : void 0
    })
    const orderedChats = computed(() => {
      return chatOrder.value.map((id) => chatMap.value.get(id)!)
    })

    const currentMessages = computed(() => {
      if (activeChat.value) {
        return activeChat.value.messages
      }
      return []
    })
    //增删改查
    function addChat() {
      const newId = addId().value
      const newChat = {
        id: newId,
        title: 'new chat',
        messages: [],
      }
      chatOrder.value.unshift(newId)
      chatMap.value.set(newId, newChat)
      activeChatId.value = newChat.id
    }

    function selectChat(id: string) {
      activeChatId.value = id
    }

    function getChatById(id: string) {
      return chatMap.value.get(id)
    }
    function updateChatTitle(id: string, title: string) {
      const chat = getChatById(id)
      if (chat) {
        chat.title = title
      }
    }
    function deleteChat(id: string) {
      const index = chatOrder.value.findIndex((chatId) => chatId === id)
      if (index === -1) return

      chatMap.value.delete(id)
      chatOrder.value.splice(index, 1)

      if (activeChatId.value === id) {
        const newActiveIndex = Math.max(index - 1, 0)
        activeChatId.value = chatOrder.value[newActiveIndex] || null
      }
    }

    function toggleLoading(value: boolean) {
      isLoading.value = value
    }

    function addMessage(message: Message) {
      if (activeChatId.value) {
        const chat = chatMap.value.get(activeChatId.value)
        chat && chat.messages.push(message)
      }
    }

    function getLastMessage() {
      if (activeChat.value) {
        return activeChat.value.messages[activeChat.value.messages.length - 1]
      }
      return null
    }

    function updateLastMessage(
      content: string,
      completion_tokens?: number,
      reasoning_content?: string
    ) {
      const lastMessage = getLastMessage()
      if (lastMessage) {
        lastMessage.content = content
        lastMessage.reasoning_content = reasoning_content
        lastMessage.completion_tokens = completion_tokens
      }
    }

    async function sendMessage(content: string) {
      const settingStore = useSettingStore()
      const updateCallback = (content: string, tokens: number, reasoning_content?: string) => {
        updateLastMessage(content, tokens, reasoning_content)
      }
      try {
        addMessage(messageHandler.formatMessage('user', content))
        addMessage(messageHandler.formatMessage('assistant', ''))

        toggleLoading(true)

        const messages = currentMessages.value.map(({ role, content }) => ({ role, content }))

        if (settingStore.settings.stream) {
          const response = await fetchChatCompletionStream(messages)
          toggleLoading(false)
          await messageHandler.handleResponse(
            response,
            settingStore.settings.stream,
            updateCallback
          )
        } else {
          const response = await fetchChatCompletion(messages)
          toggleLoading(false)
          await messageHandler.handleResponse(
            response,
            settingStore.settings.stream,
            updateCallback
          )
        }

        const chat = activeChat.value
        if (chat && chat.title === 'new chat' && chat.messages.length === 2) {
          const response = await fetchChatTitle(messages)
          const newTitle = response?.choices[0].message.content || 'new chat'
          updateChatTitle(chat.id, newTitle)
        }
      } catch (error) {
        console.error('message send error:', error)
        updateLastMessage('哦豁，发送失败了')
      } finally {
        if (isLoading.value) toggleLoading(false)
      }
    }

    function addMockMessages(mockMessages: Message[]) {
      if (activeChatId.value) {
        activeChat.value?.messages.push(...mockMessages)
      }
    }

    return {
      chatMap,
      chatOrder,
      activeChatId,
      activeChat,
      orderedChats,
      currentMessages,
      isLoading,
      addChat,
      selectChat,
      updateChatTitle,
      deleteChat,
      getChatById,
      toggleLoading,
      addMessage,
      getLastMessage,
      updateLastMessage,
      sendMessage,
      addMockMessages,
    }
  },
  {
    persist: {
      serializer: {
        serialize: (value) => {
          const serializedState = {
            ...value,
            chatMap: Array.from(value.chatMap.entries()),
          }
          return JSON.stringify(serializedState)
        },
        deserialize: (value) => {
          const state = JSON.parse(value)
          state.chatMap = new Map(state.chatMap)
          return state
        },
      },
    },
  }
)
