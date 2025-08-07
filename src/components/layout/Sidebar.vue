<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <el-button
        class="new-chat-btn"
        round
        :icon="Edit"
        @click="chatsStore.addChat"
      >
        发起新对话
      </el-button>
    </div>
    <div class="chat-list">
      <div
        v-for="chat in chatsStore.chats"
        :key="chat.id"
        class="chat-item"
        :class="{ active: chat.id === chatsStore.activeChatId }"
        @click="chatsStore.selectChat(chat.id)"
      >
        <span class="chat-title">{{ chat.title }}</span>
        <el-dropdown
          trigger="click"
          @command="handleCommand"
        >
          <el-button
            class="edit-chat-btn"
            circle
            :icon="More"
            @click.stop
          >
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :icon="EditPen"
                :command="{ action: 'rename', id: chat.id }"
                >重命名</el-dropdown-item
              >
              <el-dropdown-item
                :icon="Delete"
                :command="{ action: 'delete', id: chat.id }"
                >删除</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="sidebar-footer">
      <el-button
        class="setting-btn"
        :icon="Setting"
        size="large"
        @click="openSettingDialog"
        >设置</el-button
      >
    </div>
  </div>

  <!-- 重命名对话框 -->
  <el-dialog
    v-model="renameDialogVisible"
    title="重命名此对话"
    width="400px"
  >
    <el-input
      v-model="renameDialogInputVal"
      placeholder="请输入名称"
      align-center
    />
    <template #footer>
      <el-button @click="renameDialogVisible = false">取消</el-button>
      <el-button
        type="primary"
        @click="confirmRename"
      >
        重命名
      </el-button>
    </template>
  </el-dialog>
  <!-- 设置对话框 -->
  <el-dialog
    v-model="settingDialogVisible"
    title="设置"
    width="500"
  >
    <el-form :model="customSettings">
      <el-form-item label="apiKey">
        <el-input
          v-model="customSettings.apiKey"
          placeholder="请输入您的apiKey"
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          <div class="setting-label">
            <span>流式输出</span>
            <el-tooltip
              content="开启后, AI的回复将会像打字机一样逐字输出"
              placement="top"
            >
              <el-icon>
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
        <el-switch v-model="customSettings.stream" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="settingDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveSetting"
          >确定</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useChatsStore } from '@/stores/chats/chats'
import { Delete, Edit, EditPen, More, Setting, QuestionFilled } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import type { Chat } from '@/stores/chats/types'
import { useSettingStore } from '@/stores/setting/setting'

interface dropdownItemCommand {
  action: string
  id: string
}

const chatsStore = useChatsStore()
const settingStore = useSettingStore()

const renameDialogVisible = ref(false)
const renameDialogInputVal = ref('')
const editingChat = ref<Chat | void>(void 0)
const settingDialogVisible = ref(false)
const temApiKey = ref('')
const customSettings = reactive({
  apiKey: '',
  stream: false,
})

//打开重命名对话框
function openRenameDialog(chat: Chat) {
  renameDialogInputVal.value = chat.title
  renameDialogVisible.value = true
}

function confirmRename() {
  if (renameDialogInputVal.value && editingChat.value) {
    chatsStore.updateChatTitle(editingChat.value.id, renameDialogInputVal.value)
    renameDialogVisible.value = false
  }
}
function handleCommand(command: dropdownItemCommand) {
  if (command.action === 'delete') {
    chatsStore.deleteChat(command.id)
    return
  }
  if (command.action === 'rename') {
    editingChat.value = chatsStore.getChatById(command.id)
    editingChat.value && openRenameDialog(editingChat.value)
    return
  }
}

//api等设置
function openSettingDialog() {
  customSettings.apiKey = settingStore.settings.apiKey
  customSettings.stream = settingStore.settings.stream
  settingDialogVisible.value = true
}

function saveSetting() {
  settingStore.updatesSettings(customSettings)
  settingDialogVisible.value = false
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .sidebar-header {
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;

    .new-chat-btn {
      width: 100%;
      padding: 10px;
      border: none;
      font-size: 16px;

      .new-chat-icon {
        margin-right: 18px;
      }
    }
  }
  .chat-list {
    margin-top: 16px;

    .chat-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;

      .chat-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .chat-item:hover {
      background-color: #f0f2f5;
    }
    .chat-item.active {
      background-color: #e8f0fe;
      color: #1967d2;
      font-weight: bold;
    }

    .edit-chat-btn {
      visibility: hidden;
      opacity: 0;
      transition:
        opacity 0.2s ease-in-out,
        visibility 0.2s ease-in-out;
    }
    .chat-item:hover .edit-chat-btn {
      visibility: visible;
      opacity: 1;
      transition:
        opacity 0.2s ease-in-out,
        visibility 0.2s ease-in-out;
    }
  }

  .sidebar-footer {
    position: absolute;
    bottom: 16px;
    left: 85px;
  }
}
</style>
