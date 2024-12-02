const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config = require('../config')
const { userService } = require('../services/mockData')
const authMiddleware = require('../middleware/auth')

// 测试路由
router.get('/test', (req, res) => {
  console.log('Auth test route hit')
  res.json({ message: 'Auth routes working' })
})

// 登录路由
router.post('/login', async (req, res, next) => {
  console.log('Login route hit:', {
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers
  })
  
  try {
    const { email, password } = req.body

    // 验证必填字段
    if (!email || !password) {
      console.log('Missing required fields')
      return res.status(400).json({
        code: 400,
        message: 'Please fill in all required fields'
      })
    }

    // 查找用户
    const user = userService.findByEmail(email)
    console.log('Found user:', user ? 'yes' : 'no')

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: 'User does not exist'
      })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValidPassword)

    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: 'Incorrect password'
      })
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    // 更新最后登录时间
    user.lastLoginAt = new Date()

    // 返回用户信息（不包含密码）
    const { password: _, ...userData } = user

    console.log('Login successful')
    res.json({
      code: 200,
      data: {
        token,
        user: userData
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    next(error)
  }
})

// 获取当前用户信息
router.get('/user/info', authMiddleware, async (req, res, next) => {
  try {
    console.log('Getting user info for:', req.user.id)
    const user = userService.findById(req.user.id)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: 'User does not exist'
      })
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userData } = user
    res.json({
      code: 200,
      data: userData
    })
  } catch (error) {
    next(error)
  }
})

// 导出路由
console.log('Auth routes loaded')
module.exports = router 