<template>
  <div
    ref="scrollContainerRef"
    class="message-list-container"
  >
    <div
      v-if="activeChat"
      class="message-list"
    >
      <div
        v-for="(message, index) in activeChat.messages"
        :key="index"
        class="message-item"
        :class="[`message-from-` + message.role]"
      >
        <div class="avatar">{{ message.role === 'user' ? 'User' : 'AI' }}</div>
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>
    <div
      v-else
      class="no-active-chat"
    >
      <p>选择或创建新对话开始聊天</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatsStore } from '@/stores/chats/chats'
import { storeToRefs } from 'pinia'

const chatsStore = useChatsStore()
const { activeChat, activeChatId } = storeToRefs(chatsStore)

const scrollContainerRef = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight
    }
  })
}

watch(() => activeChat.value?.messages, scrollToBottom, { deep: true })
watch(activeChatId, scrollToBottom)
</script>

<style scoped lang="scss">
.message-list-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;

  .message-item {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .message-content {
      background-color: #fff;
      padding: 12px;
      border-radius: 8px;
      max-width: 80%;
      white-space: pre-wrap;
      line-height: 1.6;
    }
  }

  .message-from-user {
    flex-direction: row-reverse; /* 用户消息靠右 */
    .avatar {
      background-color: #67c23a;
    }
    .message-content {
      background-color: #e1ffc7;
    }
  }

  .no-active-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-color-secondary);
  }
}
</style>
