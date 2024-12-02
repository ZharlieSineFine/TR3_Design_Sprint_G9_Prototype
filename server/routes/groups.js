const router = require('express').Router()
const authMiddleware = require('../middleware/auth')

// 暂时返回空数据
router.get('/', authMiddleware, (req, res) => {
  res.json({
    code: 200,
    data: []
  })
})

module.exports = router 