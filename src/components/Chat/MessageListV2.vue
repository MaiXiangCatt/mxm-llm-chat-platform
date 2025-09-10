<template>
  <div
    ref="containerRef"
    class="message-list-container"
    @click="handleContainerClick"
  >
    <div
      v-if="activeChat"
      class="message-list"
      :style="wrapperStyle"
    >
      <div
        v-for="item in visibleData"
        :ref="observe"
        :key="item.index"
        class="message-item"
        :class="[`message-from-` + item.data.role]"
        :data-index="item.index"
        :style="getItemStyle(item.index)"
      >
        <!-- 是否展示思考过程切换按钮 -->
        <div
          v-if="item.data.reasoning_content"
          class="reasoning-toggle"
          @click="toggleReasoning(item.index)"
        >
          <span>查看思路</span>
          <el-icon
            class="toggle-icon"
            :class="{ 'is-show': isReasoningVisible(item.index) }"
          >
            <ArrowDown />
          </el-icon>
        </div>
        <!-- 推理内容 -->
        <div
          v-if="isReasoningVisible(item.index) && item.data.reasoning_content"
          class="reasoning-content"
        >
          {{ item.data.reasoning_content }}
        </div>
        <!-- 内容 -->
        <div class="message-content">
          <div
            v-if="isLoading && item.index === currentMessages.length - 1 && !item.data.content"
            class="loading-wrapper"
          >
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <div
            v-else
            v-html="renderMarkdown(item.data.content)"
          ></div>
        </div>
        <!-- 操作按钮 -->
        <div
          v-if="item.data.role === 'assistant' && !isLoading"
          class="message-actions"
        >
          <button
            class="action-btn"
            :data-tooltip="isCopied ? '已复制' : '复制'"
            @click="handleMessageCopy(item.data.content)"
          >
            <img
              :src="isCopied ? successIcon : copyIcon"
              alt="copy"
            />
          </button>
          <button
            v-if="item.index === activeChat.messages.length - 1"
            class="action-btn"
            data-tooltip="重新生成"
            @click="handleRegenerate"
          >
            <img
              :src="regenerateIcon"
              alt="regenerate"
            />
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="no-active-chat"
    >
      <h2>{{ welcomeMessage }}, 欢迎使用Mxm AI对话平台</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed, onBeforeUpdate, reactive } from 'vue'
import { useChatsStore } from '@/stores/chats/chats'
import { storeToRefs } from 'pinia'
import { renderMarkdown } from '@/utils/markdown'
import { ArrowDown, Loading } from '@element-plus/icons-vue'
import { useVirtualList } from '@/hooks/useVirtualList'
import type { Message } from '@/stores/chats/types'
import copyIcon from '@/assets/copy.png'
import successIcon from '@/assets/success.png'
import regenerateIcon from '@/assets/refresh.png'

const chatsStore = useChatsStore()
const { activeChat, activeChatId, isLoading, currentMessages } = storeToRefs(chatsStore)

const scrollContainerRef = ref<HTMLDivElement | null>(null)
const visibleReasonings = reactive(new Set<number>())
const isCopied = ref(false)

const { containerRef, visibleData, wrapperStyle, observeItem, getItemStyle, unObserveItem } =
  useVirtualList<Message>(currentMessages, {
    itemHeight: 120,
    overscan: 5,
    itemGap: 48,
  })

const itemRefs = ref<HTMLElement[]>([])

const welcomeMessage = computed(() => {
  const currentHour = new Date().getHours()
  if (currentHour < 6 || currentHour >= 18) return '晚上好'
  if (currentHour >= 6 && currentHour < 9) return '早上好'
  if (currentHour >= 9 && currentHour < 12) return '上午好'
  return '下午好'
})

function observe(el: any) {
  if (el) {
    observeItem(el as HTMLElement)
    itemRefs.value.push(el as HTMLElement)
  }
}
function toggleReasoning(index: number) {
  if (visibleReasonings.has(index)) {
    visibleReasonings.delete(index)
  } else {
    visibleReasonings.add(index)
  }
}
function isReasoningVisible(index: number) {
  return visibleReasonings.has(index)
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight
    }
  })
}

function handleContainerClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const btn = target.closest<HTMLButtonElement>('.code-action-btn')
  if (!btn) return
  event.preventDefault()
  event.stopPropagation()
  if (btn.dataset.action === 'copy') {
    handleCodeCopy(btn)
  }
}
async function handleCodeCopy(btn: HTMLButtonElement) {
  const code = btn.closest('.code-block')?.querySelector('pre code')
  if (!code) return
  const codeText = code.textContent || ''

  try {
    await navigator.clipboard.writeText(codeText)
    btn.setAttribute('data-tooltip', '已复制')
    setTimeout(() => {
      btn.setAttribute('data-tooltip', '复制')
    }, 3000)
  } catch (err) {
    console.error(err)
  }
}
async function handleMessageCopy(content: string) {
  try {
    await navigator.clipboard.writeText(content)
    isCopied.value = true

    setTimeout(() => {
      isCopied.value = false
    }, 1500)
  } catch (err) {
    console.error(err)
  }
}
async function handleRegenerate() {
  if (!activeChat.value) return
  try {
    activeChat.value.messages.pop()
    const lastUserMessage = chatsStore.getLastMessage()
    if (lastUserMessage && lastUserMessage.role === 'user') {
      activeChat.value.messages.pop()
      chatsStore.sendMessage(lastUserMessage.content)
    }
  } catch (err) {
    console.error(err)
  }
}

watch(activeChatId, scrollToBottom, { immediate: true })
watch(() => currentMessages.value.length, scrollToBottom)
onBeforeUpdate(() => {
  itemRefs.value.forEach((item) => {
    unObserveItem(item)
  })
  itemRefs.value = []
})
</script>

<style scoped lang="scss">
.message-list-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px;

  .message-list {
    position: relative;
    max-width: 800px;
    width: 100%;
    margin: 0 auto;

    .message-item {
      position: absolute;
      display: flex;
      flex-direction: column;
      width: 100%;

      .reasoning-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        margin-bottom: 8px;
        cursor: pointer;
        width: fit-content;
        border-radius: 4px;
        transition: background-color 0.2s ease-in-out;

        .toggle-icon {
          transition: transform 0.2s ease-in-out;
          &.is-show {
            transform: rotate(180deg);
          }
        }
        &:hover {
          background-color: #e9eef6;
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
        padding: 12px 16px;
        line-height: 1.6;
        word-break: break-word;
        overflow: hidden;
        position: relative;
        z-index: 1;
        max-width: 80%;
        width: fit-content;

        .content-chunks-wrapper {
          display: inline;
        }
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
        :deep(.code-block) {
          margin: 0.5rem 0;
          border: 1px solid var(--code-border);
          border-radius: 0.5rem;
          overflow: hidden; /* 改为hidden防止内容溢出影响布局 */
          width: 100%;

          > pre {
            margin: 0 !important;
          }

          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            background-color: var(--code-header-bg);

            .code-lang {
              font-size: 0.875rem;
              color: var(--code-lang-text);
              font-family: var(--code-font-family);
            }

            .code-actions {
              display: flex;
              gap: 0.5rem;

              .code-action-btn {
                width: 1.5rem;
                height: 1.5rem;
                padding: 0;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                position: relative;

                img {
                  width: 1rem;
                  height: 1rem;
                  opacity: 1;
                  transition: filter 0.2s;
                }

                &::after {
                  content: attr(data-tooltip);
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  padding: 0.25rem 0.5rem;
                  background-color: rgba(0, 0, 0, 0.75);
                  color: white;
                  font-size: 0.75rem;
                  border-radius: 4px;
                  white-space: nowrap;
                  opacity: 0;
                  visibility: hidden;
                  transition: all 0.2s ease;
                  margin-bottom: 5px;
                  z-index: 1000;
                }

                &:hover {
                  background-color: var(--code-header-button-hover-bg);
                }

                &:hover::after {
                  opacity: 1;
                  visibility: visible;
                }
              }
            }
          }

          pre.hljs {
            margin: 0 !important;
            padding: 1rem;
            background-color: var(--code-block-bg);
            overflow-x: auto;
            white-space: pre;
            code {
              white-space: pre;
            }
          }
        }
        .loading-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .message-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding-left: 0.5rem;
        position: relative;
        z-index: 1;

        .action-btn {
          width: 1.5rem;
          height: 1.5rem;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;

          img {
            width: 1rem;
            height: 1rem;
            opacity: 1;
            transition: filter 0.2s;
          }

          &::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.25rem 0.5rem;
            background-color: rgba(0, 0, 0, 0.75);
            color: white;
            font-size: 0.75rem;
            border-radius: 4px;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            margin-bottom: 5px;
          }
          &:hover {
            background-color: rgba(0, 0, 0, 0.05);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            img {
              filter: brightness(0.4);
            }
          }
          &:hover::after {
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }

    .message-from-user {
      align-items: flex-end;
      .message-content {
        background-color: #e9eef6;
        color: var(--text-color);
        border-radius: 24px;
        border-top-right-radius: 4px;
      }
    }

    .message-from-assistant {
      align-items: flex-start;
      .message-content {
        color: var(--text-color);
        white-space: pre-wrap;
      }
    }
  }

  .no-active-chat {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    color: var(--nju-primary);

    h2 {
      font-size: 2.5rem;
      font-weight: 600;
      text-align: center;
      background: linear-gradient(
        90deg,
        var(--el-color-primary-light-3),
        var(--el-color-primary),
        var(--el-color-primary-light-3),
        var(--el-color-primary)
      );
      background-size: 300% 100%; // 背景宽度为300%

      // 2. 将背景裁切为文字的形状
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}
.fade-enter-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from {
  opacity: 0;
}
</style>
