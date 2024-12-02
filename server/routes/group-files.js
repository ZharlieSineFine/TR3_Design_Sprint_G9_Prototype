const router = require('express').Router()
const { GroupFile, GroupMember, User } = require('../models')
const { Op } = require('sequelize')

// 获取群文件列表
router.get('/:groupId/files', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, type } = req.query
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

    const where = { groupId: req.params.groupId }
    if (type) {
      where.type = type
    }

    const files = await GroupFile.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: offset
    })

    res.json({
      data: files.rows,
      meta: {
        total: files.count,
        currentPage: parseInt(page),
        lastPage: Math.ceil(files.count / pageSize)
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 上传群文件
router.post('/:groupId/files', async (req, res) => {
  try {
    const { name, url, type, size } = req.body

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

    const file = await GroupFile.create({
      groupId: req.params.groupId,
      uploaderId: req.user.id,
      name,
      url,
      type,
      size
    })

    // 加载上传者信息
    const fileWithUser = await GroupFile.findByPk(file.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    })

    res.json(fileWithUser)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 删除群文件
router.delete('/:groupId/files/:fileId', async (req, res) => {
  try {
    const file = await GroupFile.findOne({
      where: {
        id: req.params.fileId,
        groupId: req.params.groupId
      }
    })

    if (!file) {
      return res.status(404).json({ message: 'File does not exist' })
    }

    // 检查权限（只能删除自己的文件或管理员可以删除任何文件）
    const member = await GroupMember.findOne({
      where: {
        groupId: req.params.groupId,
        userId: req.user.id
      }
    })

    if (!member) {
      return res.status(403).json({ message: 'You are not a group member' })
    }

    if (file.uploaderId !== req.user.id && !['owner', 'admin'].includes(member.role)) {
      return res.status(403).json({ message: 'No permission' })
    }

    await file.destroy()
    res.json({ message: 'File deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router 