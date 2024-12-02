const router = require('express').Router()
const { GroupAnnouncement, GroupMember, User } = require('../models')

// 获取群公告列表
router.get('/:groupId/announcements', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query
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

    const announcements = await GroupAnnouncement.findAndCountAll({
      where: { groupId: req.params.groupId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [
        ['pinned', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(pageSize),
      offset: offset
    })

    res.json({
      data: announcements.rows,
      meta: {
        total: announcements.count,
        currentPage: parseInt(page),
        lastPage: Math.ceil(announcements.count / pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 发布群公告
router.post('/:groupId/announcements', async (req, res) => {
  try {
    const { title, content, pinned = false } = req.body

    // 检查权限（只有管理员和群主可以发布公告）
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'No permission' })
    }

    const announcement = await GroupAnnouncement.create({
      groupId: req.params.groupId,
      authorId: req.user.id,
      title,
      content,
      pinned
    })

    // 加载作者信息
    const announcementWithUser = await GroupAnnouncement.findByPk(announcement.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    })

    res.json(announcementWithUser)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 更新群公告
router.put('/:groupId/announcements/:announcementId', async (req, res) => {
  try {
    const { title, content, pinned } = req.body

    // 检查权限
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'No permission' })
    }

    const announcement = await GroupAnnouncement.findOne({
      where: {
        id: req.params.announcementId,
        groupId: req.params.groupId
      }
    })

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    await announcement.update({
      title: title || announcement.title,
      content: content || announcement.content,
      pinned: pinned !== undefined ? pinned : announcement.pinned
    })

    res.json(announcement)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 删除群公告
router.delete('/:groupId/announcements/:announcementId', async (req, res) => {
  try {
    // 检查权限
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'No permission' })
    }

    const announcement = await GroupAnnouncement.findOne({
      where: {
        id: req.params.announcementId,
        groupId: req.params.groupId
      }
    })

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    await announcement.destroy()
    res.json({ message: 'Announcement deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router 