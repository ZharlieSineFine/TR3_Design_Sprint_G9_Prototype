import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ws } from '@/utils/websocket'
import { chatApi } from '@/api'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore()
  
  // 状态
  const chats = ref([])
  const currentChat = ref(null)
  const onlineUsers = ref(new Set())
  const typingUsers = ref(new Map()) // chatId -> Set<userId>

  // 计算属性
  const sortedChats = computed(() => {
    return [...chats.value].sort((a, b) => {
      return new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt)
    })
  })

  // 加载聊天列表
  const loadChats = async () => {
    try {
      const data = await chatApi.getChatList()
      chats.value = data
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  // 创建或获取聊天
  const createOrGetChat = async (targetId) => {
    try {
      const chat = await chatApi.createChat(targetId)
      const existingChat = chats.value.find(c => c.id === chat.id)
      if (!existingChat) {
        chats.value.unshift(chat)
      }
      return chat
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  // 发送消息
  const sendMessage = async (chatId, message) => {
    try {
      const data = await chatApi.sendMessage(chatId, message)
      // 更新本地消息列表
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.lastMessage = data
      }
      // 通过WebSocket发送消息
      ws.send({
        type: 'chat',
        chatId,
        targetId: chat.targetId,
        data
      })
      return data
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 更新输入状态
  const updateTypingStatus = (chatId, typing) => {
    ws.send({
      type: 'typing',
      chatId,
      typing
    })
  }

  // 初始化WebSocket监听
  const initWebSocket = () => {
    // 监听在线状态
    ws.on('presence', ({ userId, status }) => {
      if (status === 'online') {
        onlineUsers.value.add(userId)
      } else {
        onlineUsers.value.delete(userId)
      }
    })

    // 监听输入状态
    ws.on('typing', ({ chatId, userId, typing }) => {
      if (!typingUsers.value.has(chatId)) {
        typingUsers.value.set(chatId, new Set())
      }
      const users = typingUsers.value.get(chatId)
      if (typing) {
        users.add(userId)
      } else {
        users.delete(userId)
      }
    })

    // 监听新消息
    ws.on('chat', ({ chatId, data }) => {
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.lastMessage = data
        // 如果不是当前聊天，增加未读数
        if (currentChat.value?.id !== chatId) {
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
    })
  }

  // 标记已读
  const markAsRead = async (chatId) => {
    try {
      await chatApi.markAsRead(chatId)
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.unreadCount = 0
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  return {
    chats,
    currentChat,
    onlineUsers,
    typingUsers,
    sortedChats,
    loadChats,
    createOrGetChat,
    sendMessage,
    updateTypingStatus,
    initWebSocket,
    markAsRead
  }
}) 