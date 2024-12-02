const router = require('express').Router()
const { GroupMember, GroupMessage, GroupFile } = require('../models')
const { Op } = require('sequelize')
const sequelize = require('sequelize')

// 模拟最新动态数据
const groupStatistics = [
  {
    id: 1,
    title: 'What are the library hours today?',
    author: {
      id: 1,
      name: 'Study Expert',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=study'
    },
    type: 'question',
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15分钟前
    stats: {
      views: 56,
      likes: 3,
      comments: 8
    }
  },
  {
    id: 2,
    title: 'Sharing my graduate exam experience and study methods',
    author: {
      id: 2,
      name: 'Graduate Student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master'
    },
    type: 'article',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
    stats: {
      views: 328,
      likes: 45,
      comments: 12
    }
  },
  {
    id: 3,
    title: 'Selling brand new iPad Pro, original price, sincere transfer',
    author: {
      id: 3,
      name: 'Tech Enthusiast',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech'
    },
    type: 'marketplace',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1小时前
    stats: {
      views: 89,
      likes: 5,
      comments: 3
    }
  },
  {
    id: 4,
    title: 'Campus Photography Competition Registration Begins! Rich Prizes Await You',
    author: {
      id: 4,
      name: 'Event Official',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=official'
    },
    type: 'announcement',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    stats: {
      views: 567,
      likes: 88,
      comments: 32
    }
  },
  {
    id: 5,
    title: 'Recommended Websites for Learning Programming',
    author: {
      id: 5,
      name: 'Coder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coder'
    },
    type: 'share',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    stats: {
      views: 234,
      likes: 56,
      comments: 18
    }
  },
  {
    id: 6,
    title: 'Looking for Basketball Teammates, Fixed Games Every Weekend',
    author: {
      id: 6,
      name: 'Basketball Fan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=basketball'
    },
    type: 'activity',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    stats: {
      views: 145,
      likes: 23,
      comments: 15
    }
  },
  {
    id: 7,
    title: 'Cafeteria New Dish Tasting Report',
    author: {
      id: 7,
      name: 'Foodie',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=food'
    },
    type: 'review',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    stats: {
      views: 432,
      likes: 67,
      comments: 28
    }
  },
  {
    id: 8,
    title: 'Got an internship offer! Sharing my interview experience',
    author: {
      id: 8,
      name: 'Career Newbie',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=work'
    },
    type: 'experience',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    stats: {
      views: 678,
      likes: 89,
      comments: 45
    }
  },
  {
    id: 9,
    title: 'Dormitory Electricity Recharge System Maintenance Notice',
    author: {
      id: 9,
      name: 'System Administrator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    type: 'notice',
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    stats: {
      views: 892,
      likes: 12,
      comments: 6
    }
  },
  {
    id: 10,
    title: 'Weekend mountain climbing, anyone joining?',
    author: {
      id: 10,
      name: 'Outdoor Enthusiast',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=outdoor'
    },
    type: 'activity',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    stats: {
      views: 234,
      likes: 45,
      comments: 28
    }
  }
]

// 获取最新动态
router.get('/activities', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  const paginatedActivities = activities.slice(start, end)

  res.json({
    code: 200,
    data: paginatedActivities,
    meta: {
      total: activities.length,
      currentPage: page,
      lastPage: Math.ceil(activities.length / pageSize)
    }
  })
})

// 获取群聊统计信息
router.get('/:groupId/statistics', async (req, res) => {
  try {
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

    // 获取成员数量
    const memberCount = await GroupMember.count({
      where: { groupId: req.params.groupId }
    })

    // 获取今日消息数
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMessageCount = await GroupMessage.count({
      where: {
        groupId: req.params.groupId,
        createdAt: {
          [Op.gte]: today
        }
      }
    })

    // 获取文件统计
    const fileStats = await GroupFile.findAll({
      where: { groupId: req.params.groupId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('size')), 'totalSize']
      ],
      group: ['type']
    })

    // 获取活跃成员
    const activeMembers = await GroupMessage.findAll({
      where: {
        groupId: req.params.groupId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
        }
      },
      attributes: [
        'fromId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'messageCount']
      ],
      group: ['fromId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      include: [
        {
          model: User,
          as: 'from',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    })

    res.json({
      memberCount,
      todayMessageCount,
      fileStats,
      activeMembers
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// 获取群聊消息趋势
router.get('/:groupId/statistics/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query

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

    // 获取每日消息数量
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    const trends = await GroupMessage.findAll({
      where: {
        groupId: req.params.groupId,
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    })

    res.json(trends)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router 