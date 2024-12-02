const router = require('express').Router()
const { userService } = require('../services/mockData')
const authMiddleware = require('../middleware/auth')

// 获取用户列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const users = userService.findAll(req.query)

    res.json({
      code: 200,
      data: users
    })
  } catch (error) {
    next(error)
  }
})

// 获取用户信息
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = userService.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User does not exist'
      })
    }

    const { password: _, ...userData } = user
    res.json({
      code: 200,
      data: userData
    })
  } catch (error) {
    next(error)
  }
})

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, avatar, bio } = req.body
    const user = userService.update(req.user.id, {
      name,
      avatar,
      bio
    })

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User does not exist'
      })
    }

    const { password: _, ...userData } = user
    res.json({
      code: 200,
      data: userData
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router 