require('dotenv').config()
const app = require('./index')

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1)
    })
  }
})

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}) 