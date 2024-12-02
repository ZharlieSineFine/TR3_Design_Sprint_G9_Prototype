const router = require('express').Router()
const { chatService, messageService, userService } = require('../services/mockData')
const authMiddleware = require('../middleware/auth')

// 获取聊天列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const chats = chatService.findAllByUser(req.user.id)
    
    // 加载聊天对象信息
    const chatsWithTarget = chats.map(chat => {
      const targetId = chat.userId === req.user.id ? chat.targetId : chat.userId
      const target = userService.findById(targetId)
      const { password: _, ...targetData } = target
      return {
        ...chat,
        target: targetData
      }
    })

    res.json({
      code: 200,
      data: chatsWithTarget
    })
  } catch (error) {
    next(error)
  }
})

// 创建聊天
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { targetId } = req.body

    // 检查是否已存在聊天
    let chat = chatService.findByUsers(req.user.id, targetId)
    if (!chat) {
      chat = chatService.create({
        userId: req.user.id,
        targetId,
        unreadCount: 0
      })
    }

    // 加载聊天对象信息
    const target = userService.findById(targetId)
    const { password: _, ...targetData } = target

    res.json({
      code: 200,
      data: {
        ...chat,
        target: targetData
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取消息列表
router.get('/:chatId/messages', authMiddleware, async (req, res, next) => {
  try {
    console.log('Getting messages for chat:', req.params.chatId)
    
    const { rows, total, currentPage, lastPage } = messageService.findByChatId(
      parseInt(req.params.chatId),
      req.query
    )

    // 加载发送者信息
    const messagesWithUser = rows.map(message => {
      const from = userService.findById(message.fromId)
      const { password: _, ...fromData } = from
      return {
        ...message,
        from: fromData
      }
    })

    // 标记已读
    const chat = chatService.findById(parseInt(req.params.chatId))
    if (chat && chat.targetId === req.user.id) {
      chatService.update(chat.id, { unreadCount: 0 })
    }

    console.log('Returning messages:', messagesWithUser.length)

    res.json({
      code: 200,
      data: messagesWithUser,
      meta: {
        total,
        currentPage,
        lastPage
      }
    })
  } catch (error) {
    next(error)
  }
})

// 发送消息
router.post('/:chatId/messages', authMiddleware, async (req, res, next) => {
  try {
    const { type, content } = req.body
    const chatId = parseInt(req.params.chatId)

    const message = messageService.create({
      chatId,
      fromId: req.user.id,
      type,
      content
    })

    // 更新聊天的最后消息和未读数
    const chat = chatService.findById(chatId)
    chatService.update(chatId, {
      lastMessageId: message.id,
      unreadCount: chat.targetId === req.user.id ? 0 : chat.unreadCount + 1
    })

    // 加载发送者信息
    const from = userService.findById(req.user.id)
    const { password: _, ...fromData } = from

    res.json({
      code: 200,
      data: {
        ...message,
        from: fromData
      }
    })
  } catch (error) {
    next(error)
  }
})

// 标记已读
router.post('/:chatId/read', authMiddleware, async (req, res, next) => {
  try {
    const chatId = parseInt(req.params.chatId)
    chatService.update(chatId, { unreadCount: 0 })

    res.json({
      code: 200,
      message: 'Marked as read successfully'
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router 