import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { addId } from '@/utils/addId'
import type { Chat, Message } from './types'

export const useChatsStore = defineStore('chat', () => {
  const chats = ref<Chat[]>([])
  const activeChatId = ref<string | null>(null)
  const isLoading = ref(false)

  // function getActiveChat() {
  //   return chats.value.find((chat) => chat.id === activeChatId.value)
  // }
  const activeChat = computed(() => {
    return chats.value.find((chat) => chat.id === activeChatId.value)
  })

  const currentMessages = computed(() => {
    if (activeChat.value) {
      return activeChat.value.messages
    }
    return []
  })
  //增删改查
  function addChat() {
    const newChat = {
      id: addId().value,
      title: 'new chat',
      messages: [],
    }
    chats.value.unshift(newChat)
    activeChatId.value = newChat.id
  }

  function selectChat(id: string) {
    activeChatId.value = id
  }

  function getChatById(id: string) {
    return chats.value.find((chat) => chat.id === id)
  }
  function updateChatTitle(id: string, title: string) {
    const chat = getChatById(id)
    if (chat) {
      chat.title = title
    }
  }
  function deleteChat(id: string) {
    const index = chats.value.findIndex((chat) => chat.id === id)
    if (index === -1) return
    chats.value.splice(index, 1)
    if (activeChatId.value === id) {
      const newActiveIndex = Math.max(index - 1, 0)
      activeChatId.value = chats.value[newActiveIndex]?.id
    } else {
      activeChatId.value = null
    }
  }

  function toggleLoading(value: boolean) {
    isLoading.value = value
  }

  function addMessage(message: Message) {
    if (activeChat.value) {
      activeChat.value.messages.push(message)
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

  return {
    chats,
    activeChatId,
    activeChat,
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
  }
})
