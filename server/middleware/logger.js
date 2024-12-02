// 简单的日志中间件
const logger = (req, res, next) => {
  const start = Date.now()
  const timestamp = new Date().toISOString()

  // 请求开始日志
  console.log(`[${timestamp}] ${req.method} ${req.url}`)

  // 记录请求体
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Request Body:', req.body)
  }

  // 记录响应
  const originalSend = res.send
  res.send = function(body) {
    const duration = Date.now() - start
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`)
    return originalSend.call(this, body)
  }

  next()
}

module.exports = logger 