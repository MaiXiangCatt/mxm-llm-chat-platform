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
        <!-- 是否展示思考过程切换按钮 -->
        <div
          v-if="message.reasoning_content"
          class="reasoning-toggle"
          @click="toggleReasoning"
        >
          <span>查看思路</span>
          <el-icon
            class="toggle-icon"
            :class="{ 'is-show': isShowReasoning }"
          >
            <ArrowDown />
          </el-icon>
        </div>
        <!-- 推理内容 -->
        <div
          v-if="isShowReasoning && message.reasoning_content"
          class="reasoning-content"
          v-html="renderMarkdown(message.reasoning_content)"
        ></div>
        <div class="message-content">
          <div
            v-if="isLoading && index === currentMessages.length - 1 && !message.content"
            class="loading-wrapper"
          >
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <div
            v-else
            v-html="renderMarkdown(message.content)"
          ></div>
        </div>
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
import { renderMarkdown } from '@/utils/markdown'
import { ArrowDown, Loading } from '@element-plus/icons-vue'

const chatsStore = useChatsStore()
const { activeChat, activeChatId, isLoading, currentMessages } = storeToRefs(chatsStore)

const scrollContainerRef = ref<HTMLDivElement | null>(null)
const isShowReasoning = ref(false)

function toggleReasoning() {
  isShowReasoning.value = !isShowReasoning.value
}

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
      flex-direction: column;
      max-width: 80%;
      margin-bottom: 24px;

      .reasoning-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        margin-left: 16px;
        margin-bottom: 8px;
        cursor: pointer;
        width: fit-content;
        border-radius: 4px;
        background-color: #eef4ff;
        transition: background-color 0.2s ease-in-out;

        .toggle-icon {
          transition: transform 0.2s ease-in-out;
          &.is-show {
            transform: rotate(180deg);
          }
        }
        &:hover {
          background-color: #dbeaff;
        }
      }

      .reasoning-content {
        margin-bottom: 8px;
        margin-left: 16px;
        padding: 1rem;
        background-color: #fff;
        color: #8b8b8b;
        font-size: 14px;
        line-height: 1.6;
        border-radius: 8px;
      }

      .message-content {
        background-color: #fff;
        margin-bottom: 8px;
        margin-left: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        white-space: pre-wrap;
        line-height: 1.6;
        word-break: break-word;
        overflow: hidden;

        :deep(p) {
          margin: 0;
          &:not(:last-child) {
            margin-bottom: 0.5rem;
          }
        }
        :deep(ul),
        :deep(ol) {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        :deep(blockquote) {
          margin: 0.5rem 0;
          padding-left: 1rem;
          border-left: 4px solid var(--border-color);
          color: var(--text-color-secondary);
        }
        :deep(table) {
          border-collapse: collapse;
          margin: 0.5rem 0;
          width: 100%;

          th,
          td {
            border: 1px solid var(--border-color);
            padding: 0.5rem;
          }

          th {
            background-color: var(--code-header-bg);
          }
        }
        :deep(a) {
          color: #3f7af1;
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }

        .loading-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .message-from-user {
      align-self: flex-end;
      .message-content {
        background-color: #e9eef6;
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
