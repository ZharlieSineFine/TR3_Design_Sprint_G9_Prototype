const router = require('express').Router()

// 模拟活动数据
const activities = [
  {
    id: 1,
    title: 'Does anyone know the library opening hours today?',
    author: {
      id: 1,
      name: 'Study Expert',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=study'
    },
    type: 'question',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    stats: { views: 56, likes: 3, comments: 8 }
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
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    stats: { views: 328, likes: 45, comments: 12 }
  },
  // ... 其他活动数据保持不变 ...
]

// 获取活动列表
router.get('/', (req, res) => {
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

module.exports = router 