<template>
  <v-container fluid class="chat-container pa-0">
    <v-row no-gutters style="height: 100%">
      <!-- 聊天列表 -->
      <v-col cols="12" md="4" lg="3" class="chat-sidebar">
        <!-- 搜索栏 -->
        <div class="chat-search px-4 py-2">
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            hide-details
            placeholder="Search chats"
            prepend-inner-icon="mdi-magnify"
            class="rounded-pill"
            bg-color="grey-lighten-4"
          />
        </div>

        <!-- 聊天列表 -->
        <div class="chat-list-container">
          <chat-list
            :chats="filteredChats"
            :current-chat="currentChat"
            :online-users="onlineUsers"
            @select="handleChatSelect"
          />
        </div>
      </v-col>

      <!-- 聊天消息 -->
      <v-col cols="12" md="8" lg="9" class="chat-main">
        <template v-if="currentChat">
          <!-- 聊天头部 -->
          <v-toolbar 
            density="comfortable" 
            color="white" 
            elevation="1"
            class="chat-header"
          >
            <v-toolbar-title class="d-flex align-center">
              <v-avatar size="32" class="mr-2">
                <v-img :src="currentChat.target.avatar" />
              </v-avatar>
              {{ currentChat.target.name }}
              <v-icon
                v-if="onlineUsers.has(currentChat.target.id)"
                size="small"
                color="success"
                class="ml-2"
              >
                mdi-circle-small
              </v-icon>
            </v-toolbar-title>
          </v-toolbar>

          <!-- 聊天内容 -->
          <div class="chat-content">
            <chat-messages
              :messages="messages"
              :loading="loading"
              :sending="sending"
              :has-more="hasMore"
              :typing-users="typingUsers"
              :chat-id="currentChat?.id"
              @send="handleSend"
              @load-more="loadMoreMessages"
              @revoke="handleRevoke"
            />
          </div>
        </template>

        <!-- 空状态 -->
        <div
          v-else
          class="d-flex align-center justify-center fill-height text-grey"
        >
          <div class="text-center">
            <v-icon size="64" class="mb-4">mdi-chat-outline</v-icon>
            <div>Select a chat or start a new conversation</div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from '@/utils/message'
import { chatApi } from '@/api'
import { ws } from '@/utils/websocket'
import ChatList from '@/components/chat/ChatList.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'

const route = useRoute()
const { showMessage, showError } = useMessage()

// 状态
const chats = ref([])
const currentChat = ref(null)
const messages = ref([])
const loading = ref(false)
const sending = ref(false)
const hasMore = ref(false)
const page = ref(1)
const onlineUsers = ref(new Set())
const typingUsers = ref(new Map())

// 添加搜索状态
const searchQuery = ref('')

// 计算过滤后的聊天列表
const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value

  const query = searchQuery.value.toLowerCase()
  return chats.value.filter(chat => 
    chat.target.name.toLowerCase().includes(query)
  )
})

// 加载聊天列表
const loadChats = async () => {
  try {
    const { data } = await chatApi.getChats()
    chats.value = data

    // 如果URL中有targetId，自动打开对应的聊天
    const targetId = parseInt(route.query.targetId)
    if (targetId) {
      const chat = chats.value.find(c => c.target.id === targetId)
      if (chat) {
        await handleChatSelect(chat)
      } else {
        // 创建新的聊天
        const { data: newChat } = await chatApi.createChat(targetId)
        chats.value.unshift(newChat)
        await handleChatSelect(newChat)
      }
    }
  } catch (error) {
    showError(error)
  }
}

// 加载消息列表
const loadMessages = async (chatId, isLoadMore = false) => {
  if (!chatId) return

  try {
    loading.value = true
    const { data, meta } = await chatApi.getMessages(chatId, {
      page: isLoadMore ? page.value + 1 : 1
    })

    if (isLoadMore) {
      messages.value.unshift(...data)
      page.value++
    } else {
      messages.value = data
      page.value = 1
    }

    hasMore.value = page.value < meta.lastPage

    // 标记已读
    if (currentChat.value?.unreadCount) {
      await chatApi.markAsRead(chatId)
      currentChat.value.unreadCount = 0
    }
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 加载更多消息
const loadMoreMessages = () => {
  if (!currentChat.value || loading.value || !hasMore.value) return
  loadMessages(currentChat.value.id, true)
}

// 选择聊天
const handleChatSelect = async (chat) => {
  if (!chat) return
  
  currentChat.value = chat
  messages.value = [] // 清空消息列表
  page.value = 1 // 重置页码
  hasMore.value = false // 重置加载更多状态
  
  await loadMessages(chat.id)
}

// 发送消息
const handleSend = async (message) => {
  if (!currentChat.value) return

  try {
    sending.value = true
    const data = await chatApi.sendMessage(currentChat.value.id, message)
    messages.value.push(data)
    currentChat.value.lastMessage = data

    // 将当前聊天移到顶部
    const index = chats.value.indexOf(currentChat.value)
    if (index > 0) {
      chats.value.splice(index, 1)
      chats.value.unshift(currentChat.value)
    }
  } catch (error) {
    showError(error)
  } finally {
    sending.value = false
  }
}

// 撤回消息
const handleRevoke = async (message) => {
  try {
    await chatApi.revokeMessage(currentChat.value.id, message.id)
    const index = messages.value.indexOf(message)
    if (index !== -1) {
      messages.value[index].type = 'revoke'
      messages.value[index].content = null
    }
    showMessage('Message recalled')
  } catch (error) {
    showError(error)
  }
}

// WebSocket 消息处理
const handleWebSocketMessage = (message) => {
  console.log('Received WebSocket message:', message)
  
  switch (message.type) {
    case 'chat':
      // 处理新消息
      if (currentChat.value?.id === message.chatId) {
        messages.value.push(message.data)
      }
      // 更新聊天列表
      const chat = chats.value.find(c => c.id === message.chatId)
      if (chat) {
        chat.lastMessage = message.data
        if (currentChat.value?.id !== message.chatId) {
          chat.unreadCount = (chat.unreadCount || 0) + 1
        }
        // 将聊天移到顶部
        const index = chats.value.indexOf(chat)
        if (index > 0) {
          chats.value.splice(index, 1)
          chats.value.unshift(chat)
        }
      } else {
        // 如果是新的聊天，重新加载列表
        loadChats()
      }
      break

    case 'presence':
      // 处理在线状态
      if (message.status === 'online') {
        onlineUsers.value.add(message.userId)
      } else {
        onlineUsers.value.delete(message.userId)
      }
      break

    case 'typing':
      // 处理输入状态
      if (!typingUsers.value.has(message.chatId)) {
        typingUsers.value.set(message.chatId, new Set())
      }
      const users = typingUsers.value.get(message.chatId)
      if (message.typing) {
        users.add(message.userId)
      } else {
        users.delete(message.userId)
      }
      break
  }
}

// 生命周期钩子
onMounted(async () => {
  await loadChats() // 等待聊天列表加载完成
  
  // 监听 WebSocket 消息
  ws.on('chat', handleWebSocketMessage)
  ws.on('presence', handleWebSocketMessage)
  ws.on('typing', handleWebSocketMessage)
})

onUnmounted(() => {
  // 移除 WebSocket 监听
  ws.off('chat', handleWebSocketMessage)
  ws.off('presence', handleWebSocketMessage)
  ws.off('typing', handleWebSocketMessage)
})
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 64px);
  background-color: #f5f5f5;
}

.chat-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chat-search {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.chat-list-container {
  flex: 1;
  overflow: hidden;
}

.chat-main {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chat-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.chat-content {
  flex: 1;
  overflow: hidden;
  background-color: #f5f5f5;
}

/* 响应式调整 */
@media (max-width: 960px) {
  .chat-container {
    height: calc(100vh - 56px);
  }

  .chat-sidebar {
    height: auto;
    max-height: 100%;
  }
}
</style> 