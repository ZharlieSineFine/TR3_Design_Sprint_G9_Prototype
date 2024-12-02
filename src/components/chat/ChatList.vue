<template>
  <div class="chat-list">
    <!-- 聊天列表 -->
    <v-list v-if="chats.length">
      <v-list-item
        v-for="chat in chats"
        :key="chat.id"
        :active="currentChat?.id === chat.id"
        @click="selectChat(chat)"
      >
        <template v-slot:prepend>
          <v-badge
            :model-value="chat.unreadCount > 0"
            :content="chat.unreadCount"
            color="error"
          >
            <v-avatar size="40">
              <v-img :src="chat.target.avatar" />
            </v-avatar>
          </v-badge>
        </template>

        <v-list-item-title class="d-flex align-center">
          {{ chat.target.name }}
          <v-icon
            v-if="onlineUsers.has(chat.target.id)"
            size="small"
            color="success"
            class="ml-2"
          >
            mdi-circle-small
          </v-icon>
        </v-list-item-title>

        <v-list-item-subtitle class="text-truncate">
          <template v-if="chat.lastMessage">
            <template v-if="chat.lastMessage.type === 'text'">
              {{ chat.lastMessage.content }}
            </template>
            <template v-else-if="chat.lastMessage.type === 'image'">
              [Image]
            </template>
            <template v-else-if="chat.lastMessage.type === 'file'">
              [File]
            </template>
            <template v-else>
              [Unknown message type]
            </template>
          </template>
        </v-list-item-subtitle>

        <template v-slot:append>
          <div class="text-caption text-grey">
            {{ formatTime(chat.lastMessage?.createdAt) }}
          </div>
        </template>
      </v-list-item>
    </v-list>

    <!-- 空状态 -->
    <div v-else class="text-center text-grey pa-4">
      No chat history
    </div>
  </div>
</template>

<script setup>
import { formatTime } from '@/utils/date'

const props = defineProps({
  chats: {
    type: Array,
    required: true,
    default: () => []
  },
  currentChat: {
    type: Object,
    default: null
  },
  onlineUsers: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['select'])

// 选择聊天
const selectChat = (chat) => {
  emit('select', chat)
}
</script>

<style scoped>
.chat-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-list {
  flex: 1;
  overflow-y: auto;
}

.v-list-item--active {
  background-color: rgb(var(--v-theme-primary), 0.1);
}
</style> 