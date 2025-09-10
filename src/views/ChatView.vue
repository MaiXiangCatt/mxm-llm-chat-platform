<template>
  <div class="chat-view">
    <Sidebar></Sidebar>
    <div class="main-content">
      <!-- <message-list></message-list> -->
      <MessageListV2></MessageListV2>
      <chat-input></chat-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import ChatInput from '@/components/Chat/ChatInput.vue'
import MessageList from '@/components/Chat/MessageList.vue'
import MessageListV2 from '@/components/Chat/MessageListV2.vue'
</script>

<style scoped lang="scss">
.chat-view {
  display: flex;
  height: 100vh;
  width: 100vw;

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow: hidden;
  }
}
</style>
