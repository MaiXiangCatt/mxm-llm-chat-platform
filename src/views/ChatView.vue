<template>
  <div class="chat-view">
    <Sidebar></Sidebar>
    <div class="main-content">
      <message-list></message-list>
      <chat-input></chat-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import ChatInput from '@/components/Chat/ChatInput.vue'
import MessageList from '@/components/Chat/MessageList.vue'
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
