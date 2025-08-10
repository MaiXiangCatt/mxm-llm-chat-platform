<template>
  <div class="chat-input-area">
    <el-input
      v-model="inputValue"
      placeholder="输入消息...(Shift+Enter换行)"
      type="textarea"
      :row="4"
      resize="none"
      @keydown.enter.prevent="sendMessage"
    >
    </el-input>
    <el-button
      class="send-btn"
      circle
      size="large"
      :icon="Position"
      :disabled="chatsStore.isLoading || !inputValue.trim()"
      @click="sendMessage"
    ></el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatsStore } from '@/stores/chats/chats'
import { useSettingStore } from '@/stores/setting/setting'
import { Position } from '@element-plus/icons-vue'
import { messageHandler } from '@/utils/message'
import { fetchChatCompletion, fetchChatCompletionStream } from '@/utils/api'

const chatsStore = useChatsStore()
const settingStore = useSettingStore()

const inputValue = ref('')

async function handleSend(content: string) {
  const updateCallback = (content: string, tokens: number, reasoning_content?: string) => {
    chatsStore.updateLastMessage(content, tokens, reasoning_content)
  }
  try {
    chatsStore.addMessage(messageHandler.formatMessage('user', content))
    chatsStore.addMessage(messageHandler.formatMessage('assistant', ''))

    chatsStore.toggleLoading(true)

    const messages = chatsStore.currentMessages.map(({ role, content }) => ({ role, content }))

    if (settingStore.settings.stream) {
      const response = await fetchChatCompletionStream(messages)
      await messageHandler.handleResponse(response, settingStore.settings.stream, updateCallback)
    } else {
      const response = await fetchChatCompletion(messages)
      await messageHandler.handleResponse(response, settingStore.settings.stream, updateCallback)
    }
  } catch (error) {
    console.error('message send error:', error)
    chatsStore.updateLastMessage('哦豁，发送失败了')
  } finally {
    chatsStore.toggleLoading(false)
  }
}
function sendMessage() {
  if (!inputValue.value.trim() || chatsStore.isLoading) return

  handleSend(inputValue.value)
  inputValue.value = ''
}
</script>

<style scoped lang="scss">
.chat-input-area {
  position: relative;
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid var(--border-color);
  width: 760px;
  left: calc(50% - 380px);
  border-radius: 16px;

  .send-btn {
    position: absolute;
    bottom: 25px;
    right: 30px;
  }
}
</style>
