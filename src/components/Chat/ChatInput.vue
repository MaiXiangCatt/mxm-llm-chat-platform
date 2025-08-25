<template>
  <div class="chat-input-area">
    <el-input
      v-model="inputValue"
      placeholder="输入消息...(Shift+Enter换行)"
      type="textarea"
      :row="4"
      resize="none"
      @keydown.enter.exact.prevent="sendMessage"
    >
    </el-input>
    <el-button
      class="send-btn"
      circle
      size="large"
      :icon="Promotion"
      :disabled="chatsStore.isLoading || !inputValue.trim()"
      @click="sendMessage"
    ></el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatsStore } from '@/stores/chats/chats'
import { Promotion } from '@element-plus/icons-vue'

const chatsStore = useChatsStore()

const inputValue = ref('')

async function handleSend(content: string) {
  await chatsStore.sendMessage(content)
}
function sendMessage() {
  const trimmedValue = inputValue.value.trim()
  if (!trimmedValue || chatsStore.isLoading) return

  handleSend(trimmedValue)
  inputValue.value = ''
}
</script>

<style scoped lang="scss">
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background-color: #fff;
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  width: 100%;
  max-width: 800px;

  margin: 0 auto;

  :deep(.el-textarea) {
    flex-grow: 1;

    .el-textarea__inner {
      background-color: transparent;
      box-shadow: none !important;
      padding: 0;
      color: var(--text-color-primary);
      font-size: 1rem;
      line-height: 1.6;
    }
  }
  .send-btn {
    flex-shrink: 0;
    color: var(--text-color);
    background-color: #fff;

    :deep(.el-icon) {
      font-size: 1.5rem;
      color: var(--text-color);
    }
  }
}
</style>
