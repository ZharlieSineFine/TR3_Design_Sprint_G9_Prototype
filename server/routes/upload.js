const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'misc'
    const dir = path.join(__dirname, `../uploads/${type}`)
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    // Generate unique file name
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: /^image\/(jpeg|png|gif)$/,
    voice: /^audio\/(mp3|wav|ogg)$/,
    file: /.*/
  }

  const type = req.params.type || 'misc'
  const mimeTypeRegex = allowedTypes[type] || allowedTypes.file

  if (mimeTypeRegex.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

// Upload file
router.post('/:type?', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file' })
    }

    // Return file URL
    const fileUrl = `/uploads/${req.params.type || 'misc'}/${req.file.filename}`
    res.json({ url: fileUrl })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

// Upload voice file
router.post('/voice', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file' })
    }

    // Check file type
    if (!req.file.mimetype.startsWith('audio/')) {
      return res.status(400).json({ message: 'Unsupported file type' })
    }

    // Return file URL
    const fileUrl = `/uploads/voice/${req.file.filename}`
    res.json({ url: fileUrl })
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' })
  }
})

// Delete file
router.delete('/:type/:filename', async (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      `../uploads/${req.params.type}/${req.params.filename}`
    )

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ message: 'File deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

module.exports = router 