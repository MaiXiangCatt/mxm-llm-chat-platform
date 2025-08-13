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
