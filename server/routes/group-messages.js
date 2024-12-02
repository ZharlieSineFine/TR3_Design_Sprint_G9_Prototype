const router = require('express').Router()
const { GroupMessage, GroupMember, User } = require('../models')

// 获取群聊消息列表
router.get('/:groupId/messages', async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const offset = (page - 1) * pageSize

    // 检查用户是否是群成员
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member) {
      return res.status(403).json({ message: 'You are not a group member' })
    }

    const messages = await GroupMessage.findAndCountAll({
      where: { groupId: req.params.groupId },
      include: [
        {
          model: User,
          as: 'from',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset
    })

    res.json({
      data: messages.rows,
      meta: {
        total: messages.count,
        currentPage: parseInt(page),
        lastPage: Math.ceil(messages.count / pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 发送群聊消息
router.post('/:groupId/messages', async (req, res) => {
  try {
    const { type, content } = req.body

    // 检查用户是否是群成员
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member) {
      return res.status(403).json({ message: 'You are not a group member' })
    }

    // 检查是否被禁言
    if (member.muteEndTime && new Date(member.muteEndTime) > new Date()) {
      return res.status(403).json({ message: 'You are muted' })
    }

    const message = await GroupMessage.create({
      groupId: req.params.groupId,
      fromId: req.user.id,
      type,
      content
    })

    // 加载发送者信息
    const messageWithUser = await GroupMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'from',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    })

    res.json(messageWithUser)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 撤回群聊消息
router.post('/:groupId/messages/:messageId/revoke', async (req, res) => {
  try {
    const message = await GroupMessage.findOne({
      where: {
        id: req.params.messageId,
        groupId: req.params.groupId
      }
    })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // 检查权限（只能撤回自己的消息或管理员可以撤回任何消息）
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member) {
      return res.status(403).json({ message: 'You are not a group member' })
    }

    if (message.fromId !== req.user.id && !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'No permission' })
    }

    // 检查是否在2分钟内（管理员不受时间限制）
    if (message.fromId === req.user.id && !['owner', 'admin'].includes(member.role)) {
      const now = new Date()
      const messageTime = new Date(message.createdAt)
      const diffMinutes = (now - messageTime) / 1000 / 60

      if (diffMinutes > 2) {
        return res.status(400).json({ message: 'Can only recall messages within 2 minutes' })
      }
    }

    message.type = 'revoke'
    message.content = null
    await message.save()

    res.json(message)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router 