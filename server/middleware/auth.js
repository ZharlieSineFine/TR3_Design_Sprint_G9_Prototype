const jwt = require('jsonwebtoken')
const config = require('../config')
const { userService } = require('../services/mockData')

const authMiddleware = (req, res, next) => {
  console.log('Auth headers:', req.headers)
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    console.log('No token provided')
    return res.status(401).json({
      code: 401,
      message: 'Please login first'
    })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    console.log('Decoded token:', decoded)
    
    const user = userService.findById(decoded.id)
    if (!user) {
      console.log('User not found:', decoded.id)
      return res.status(401).json({
        code: 401,
        message: 'User does not exist'
      })
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        code: 403,
        message: 'Account has been banned'
      })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error('Token verification failed:', error)
    return res.status(401).json({
      code: 401,
      message: 'Invalid token'
    })
  }
}

module.exports = authMiddleware 