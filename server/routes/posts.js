const router = require('express').Router()
const authMiddleware = require('../middleware/auth')

// Get post list
router.get('/', async (req, res, next) => {
  try {
    const posts = [
      {
        id: 1,
        title: 'Recommended Computer Science Essential Books',
        content: 'Hello everyone, I am a freshman in Computer Science. I want to systematically learn computer science fundamentals. Please recommend some classic CS books...',
        preview: 'Hello everyone, I am a freshman in Computer Science. I want to systematically learn...',
        category: { id: 'study', name: 'Study' },
        images: [],
        author: {
          id: 1,
          name: 'Learning Expert',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=learner'
        },
        createdAt: new Date(),
        likes: 42,
        comments: 15,
        views: 230,
        isLiked: false
      },
      {
        id: 2,
        title: 'Campus Photography Showcase',
        content: 'Spring is here, and the cherry blossoms in campus are blooming beautifully. Sharing some photos I took today...',
        preview: 'Spring is here, and the cherry blossoms in campus are blooming beautifully...',
        category: { id: 'life', name: 'Life' },
        images: [
          'https://images.unsplash.com/photo-1614755240580-4d95e45674bc',
          'https://images.unsplash.com/photo-1615185992944-af8116500120',
          'https://images.unsplash.com/photo-1615185991335-c70878c49e8c'
        ],
        author: {
          id: 2,
          name: 'Photographer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photographer'
        },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likes: 156,
        comments: 28,
        views: 520,
        isLiked: false
      },
      {
        id: 3,
        title: 'Recommended Campus Running Routes',
        content: 'Sharing some of my favorite campus running routes, with great scenery and not too crowded...',
        preview: 'Sharing some of my favorite campus running routes, with great scenery...',
        category: { id: 'life', name: 'Life' },
        images: [
          'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee',
          'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8'
        ],
        author: {
          id: 3,
          name: 'Sports Expert',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likes: 89,
        comments: 12,
        views: 345,
        isLiked: false
      }
    ]

    res.json({
      code: 200,
      data: posts
    })
  } catch (error) {
    next(error)
  }
})

// Get post details
router.get('/:id', async (req, res, next) => {
  try {
    const post = {
      id: parseInt(req.params.id),
      title: 'Recommended Computer Science Essential Books',
      content: `Hello everyone, I am a freshman in Computer Science. I want to systematically learn computer science fundamentals. Please recommend some classic CS books.

Currently reading:
1. C++ Primer
2. Data Structures and Algorithm Analysis
3. Computer Networks: A Top-Down Approach

Please recommend some other classic CS books that are must-read, with difficulty and recommended reading order. Thank you!`,
      category: { id: 'study', name: 'Study' },
      images: [],
      author: {
        id: 1,
        name: 'Learning Expert',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=learner'
      },
      createdAt: new Date(),
      likes: 42,
      comments: [
        {
          id: 1,
          content: 'Recommend "In-Depth Understanding of Computer Systems" (Understanding the Computer System), although it is a bit difficult, it is a classic',
          author: {
            id: 2,
            name: 'Senior Programmer',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=programmer'
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          likes: 15,
          isLiked: false,
          replies: [
            {
              id: 2,
              content: 'Agree, this book is a must-read classic',
              author: {
                id: 3,
                name: 'CS Enthusiast',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cs'
              },
              replyTo: {
                id: 2,
                name: 'Senior Programmer'
              },
              createdAt: new Date(Date.now() - 20 * 60 * 1000),
              likes: 5,
              isLiked: false
            }
          ]
        },
        {
          id: 3,
          content: 'Recommend finishing "Algorithm Introduction" (Algorithm Design) first, as it is important to lay a solid foundation',
          author: {
            id: 4,
            name: 'Algorithm Expert',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=algorithm'
          },
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          likes: 8,
          isLiked: false,
          replies: []
        }
      ],
      views: 230,
      isLiked: false,
      isCollected: false
    }

    res.json({
      code: 200,
      data: post
    })
  } catch (error) {
    next(error)
  }
})

// Create post
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const post = {
      id: Date.now(),
      ...req.body,
      author: {
        id: req.user.id,
        name: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      },
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      views: 0,
      isLiked: false,
      isCollected: false
    }

    res.json({
      code: 200,
      data: post
    })
  } catch (error) {
    next(error)
  }
})

// Like post
router.post('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    res.json({
      code: 200,
      message: 'Operation successful'
    })
  } catch (error) {
    next(error)
  }
})

// Collect post
router.post('/:id/collect', authMiddleware, async (req, res, next) => {
  try {
    res.json({
      code: 200,
      message: 'Operation successful'
    })
  } catch (error) {
    next(error)
  }
})

// Comment on post
router.post('/:id/comments', authMiddleware, async (req, res, next) => {
  try {
    const comment = {
      id: Date.now(),
      content: req.body.content,
      author: {
        id: req.user.id,
        name: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      },
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    }

    res.json({
      code: 200,
      data: comment
    })
  } catch (error) {
    next(error)
  }
})

// Reply to comment
router.post('/:id/comments/:commentId/replies', authMiddleware, async (req, res, next) => {
  try {
    const reply = {
      id: Date.now(),
      content: req.body.content,
      author: {
        id: req.user.id,
        name: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      },
      replyTo: {
        id: req.body.replyTo.id,
        name: req.body.replyTo.name
      },
      createdAt: new Date(),
      likes: 0,
      isLiked: false
    }

    res.json({
      code: 200,
      data: reply
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router