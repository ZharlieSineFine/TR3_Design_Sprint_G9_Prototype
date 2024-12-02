const config = require('../config')

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // 开发环境返回详细错误信息
  const isDev = process.env.NODE_ENV === 'development'

  // JWT 认证错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'Invalid token',
      ...(isDev ? { error: err.message } : {})
    })
  }

  // 默认错误响应
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || 'Server error',
    ...(isDev ? { 
      error: err.message,
      stack: err.stack
    } : {})
  })
}

module.exports = errorHandler 