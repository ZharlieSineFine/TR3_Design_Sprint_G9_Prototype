const router = require('express').Router()
const authMiddleware = require('../middleware/auth')

// Simulated data
const notifications = [
  {
    id: 1,
    type: 'comment',
    title: 'New Comment',
    content: 'User A commented on your post "Vue3 Learning Notes": "Very detailed, learned a lot"',
    link: '/forum/post/1',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  {
    id: 2,
    type: 'like',
    title: 'Like',
    content: 'User B liked your post "React vs Vue"',
    link: '/forum/post/2',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  },
  {
    id: 3,
    type: 'system',
    title: 'System Notification',
    content: 'Your post was deleted due to violation of community rules, please follow the community rules',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 4,
    type: 'mention',
    title: '@ Mention',
    content: 'User C mentioned you in the post "Frontend Framework Selection": "@admin What do you think?"',
    link: '/forum/post/3',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 5,
    type: 'follow',
    title: 'New Follower',
    content: 'User D followed you',
    link: '/profile',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: 6,
    type: 'comment',
    title: 'New Reply',
    content: 'User E replied to your comment: "You are right, I also think so"',
    link: '/forum/post/4',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 7,
    type: 'marketplace',
    title: 'Secondhand Transaction',
    content: 'Someone is interested in your product "iPhone 13" and started a chat',
    link: '/chat?targetId=123',
    isRead: false,
    createdAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 8,
    type: 'system',
    title: 'Account Security',
    content: 'A new device has logged in to your account. If it is not you, please change your password immediately',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 9,
    type: 'like',
    title: 'Like',
    content: 'User F liked your comment',
    link: '/forum/post/5',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 10,
    type: 'comment',
    title: 'Reply',
    content: 'User G replied to your comment: "Can you explain it in more detail?"',
    link: '/forum/post/6',
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    id: 11,
    type: 'marketplace',
    title: 'Product Status Update',
    content: 'Your product "MacBook Pro" has been sold',
    link: '/marketplace',
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 12,
    type: 'system',
    title: 'Activity Notification',
    content: 'A new campus activity "Programming Marathon" is about to start. Click to view details',
    link: '/activities/1',
    isRead: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    id: 13,
    type: 'mention',
    title: 'Post Mention',
    content: 'User H mentioned you in the post "Campus Life"',
    link: '/forum/post/7',
    isRead: true,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
  },
  {
    id: 14,
    type: 'follow',
    title: 'Follow',
    content: 'User I followed you',
    link: '/profile',
    isRead: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: 15,
    type: 'system',
    title: 'System Maintenance Notification',
    content: 'The system will be upgraded from 22:00-23:00 tonight',
    isRead: true,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
  }
]

// Get notification list
router.get('/', authMiddleware, (req, res) => {
  // Only return the latest 5 notifications
  const recentNotifications = notifications.slice(0, 5)
  res.json({
    code: 200,
    data: recentNotifications
  })
})

// Get notification history
router.get('/history', authMiddleware, (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 10
  const start = (page - 1) * pageSize
  const end = start + pageSize

  const paginatedNotifications = notifications.slice(start, end)
  
  res.json({
    code: 200,
    data: paginatedNotifications,
    meta: {
      total: notifications.length,
      currentPage: page,
      lastPage: Math.ceil(notifications.length / pageSize)
    }
  })
})

// Mark notification as read
router.post('/:id/read', authMiddleware, (req, res) => {
  const notification = notifications.find(n => n.id === parseInt(req.params.id))
  if (notification) {
    notification.isRead = true
  }
  res.json({
    code: 200,
    message: 'Marked successfully'
  })
})

// Mark all notifications as read
router.post('/read-all', authMiddleware, (req, res) => {
  notifications.forEach(notification => {
    notification.isRead = true
  })
  res.json({
    code: 200,
    message: 'Marked successfully'
  })
})

// Get unread notification count
router.get('/unread-count', authMiddleware, (req, res) => {
  const count = notifications.filter(n => !n.isRead).length
  res.json({
    code: 200,
    data: count
  })
})

module.exports = router 