const { chatService, messageService, userService } = require('../services/mockData')

// Message type handler mapping
const messageHandlers = {
  // Chat message
  chat: async (message, user, wsClients) => {
    const { chatId, data } = message
    console.log('Handling chat message:', { chatId, data })
    
    // Create message
    const newMessage = messageService.create({
      chatId,
      fromId: user.id,
      type: data.type,
      content: data.content
    })

    // Update chat's last message and unread count
    const chat = chatService.findById(chatId)
    if (chat) {
      chatService.update(chatId, {
        lastMessageId: newMessage.id,
        unreadCount: chat.targetId === user.id ? 0 : chat.unreadCount + 1
      })

      // Load sender information
      const from = userService.findById(user.id)
      const { password: _, ...fromData } = from

      // Send to target user
      const targetId = chat.userId === user.id ? chat.targetId : chat.userId
      const targetWs = wsClients.get(targetId)
      if (targetWs) {
        targetWs.send(JSON.stringify({
          type: 'chat',
          chatId,
          data: {
            ...newMessage,
            from: fromData
          }
        }))
      }
    }
  },

  // Online status
  presence: async (message, user, wsClients) => {
    const { status } = message
    console.log('Handling presence:', { userId: user.id, status })
    
    // Update user status
    userService.update(user.id, { status })

    // Notify all chat objects
    const chats = chatService.findAllByUser(user.id)
    chats.forEach(chat => {
      const targetId = chat.userId === user.id ? chat.targetId : chat.userId
      const targetWs = wsClients.get(targetId)
      if (targetWs) {
        targetWs.send(JSON.stringify({
          type: 'presence',
          userId: user.id,
          status
        }))
      }
    })
  },

  // Typing status
  typing: async (message, user, wsClients) => {
    const { chatId, typing } = message
    console.log('Handling typing:', { userId: user.id, chatId, typing })
    
    // Send to target user
    const chat = chatService.findById(chatId)
    if (chat) {
      const targetId = chat.userId === user.id ? chat.targetId : chat.userId
      const targetWs = wsClients.get(targetId)
      
      if (targetWs) {
        targetWs.send(JSON.stringify({
          type: 'typing',
          chatId,
          userId: user.id,
          typing
        }))
      }
    }
  }
}

// Handle WebSocket message
const handleMessage = async (message, user, wsClients) => {
  try {
    console.log('Received message:', message)
    const handler = messageHandlers[message.type]
    if (handler) {
      await handler(message, user, wsClients)
    } else {
      console.warn('Unknown message type:', message.type)
    }
  } catch (error) {
    console.error('WebSocket message handler error:', error)
  }
}

module.exports = handleMessage 