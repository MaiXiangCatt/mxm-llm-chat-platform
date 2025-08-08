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
        <div
          class="message-content"
          v-html="renderMarkdown(message.content)"
        ></div>
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
import { ref, nextTick, watch, computed } from 'vue'
import { useChatsStore } from '@/stores/chats/chats'
import { storeToRefs } from 'pinia'
import { renderMarkdown } from '@/utils/markdown'

const chatsStore = useChatsStore()
const { activeChat, activeChatId, currentMessages } = storeToRefs(chatsStore)

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

  .message-list {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .message-item {
      display: flex;
      max-width: 80%;
      margin-bottom: 24px;

      .message-content {
        background-color: #fff;
        padding: 12px 16px;
        border-radius: 12px;
        white-space: pre-wrap;
        line-height: 1.6;
        word-break: break-word;
      }
    }

    .message-from-user {
      align-self: flex-end;
      .message-content {
        background-color: #e1ffc7;
      }
    }

    .message-from-assistant {
      align-self: flex-start;
      .message-content {
        background-color: #fff;
        color: var(--text-color);
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
}
</style>
