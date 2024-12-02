const router = require('express').Router()
const authMiddleware = require('../middleware/auth')

// Get item list
router.get('/items', async (req, res, next) => {
  try {
    // Simulated data
    const items = [
      {
        id: 1,
        title: 'iPhone 13 Pro Max',
        price: 5999,
        description: '99% new, bought last year, complete accessories, no scratches',
        images: [
          'https://images.unsplash.com/photo-1591337676887-a217a6970a8a',  // iPhone image
          'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd'   // Accessory image
        ],
        status: 'available',
        category: 'digital',
        condition: '90',
        seller: {
          id: 1,
          name: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        },
        createdAt: new Date()
      },
      {
        id: 2,
        title: 'Data Structures and Algorithm Analysis 3rd Edition',
        price: 30,
        description: 'Computer Science textbook, some notes, suitable for second-hand purchase',
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',  // Book image
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6'  // Book detail
        ],
        status: 'available',
        category: 'books',
        condition: '80',
        seller: {
          id: 2,
          name: 'Book Lover',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reader'
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Giant Bicycle',
        price: 800,
        description: 'Ridden for half a year, good condition, suitable for campus commuting',
        images: [
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7',  // Bicycle image
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e'   // Bicycle detail
        ],
        status: 'available',
        category: 'life',
        condition: '80',
        seller: {
          id: 3,
          name: 'Sports Enthusiast',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sports'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        title: '27-inch 2K Monitor',
        price: 1200,
        description: 'Dell U2723QE, 4K resolution, Type-C interface, suitable for MacBook',
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',  // Monitor image
          'https://images.unsplash.com/photo-1585792180666-f7347c490ee2'   // Monitor detail
        ],
        status: 'available',
        category: 'digital',
        condition: 'new',
        seller: {
          id: 1,
          name: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 5,
        title: 'Mechanical Keyboard with Cherry Switches',
        price: 299,
        description: 'Cherry MX Red mechanical keyboard, excellent hand feel, with RGB backlight',
        images: [
          'https://images.unsplash.com/photo-1595225476474-87563907a212',  // Keyboard image
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3'   // Keyboard close-up
        ],
        status: 'available',
        category: 'digital',
        condition: '95',
        seller: {
          id: 4,
          name: 'Tech Enthusiast',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech'
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]

    // Handle filtering
    const { search, category, condition, priceRange } = req.query
    let filteredItems = [...items]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      )
    }

    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category)
    }

    if (condition) {
      filteredItems = filteredItems.filter(item => item.condition === condition)
    }

    if (priceRange) {
      const [min, max] = priceRange
      filteredItems = filteredItems.filter(item => 
        item.price >= min && item.price <= max
      )
    }

    // Handle sorting
    const { sortBy = 'latest' } = req.query
    switch (sortBy) {
      case 'price_asc':
        filteredItems.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        filteredItems.sort((a, b) => b.price - a.price)
        break
      case 'latest':
      default:
        filteredItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    res.json({
      code: 200,
      data: filteredItems,
      meta: {
        total: filteredItems.length,
        currentPage: 1,
        lastPage: 1
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get item details
router.get('/items/:id', async (req, res, next) => {
  try {
    const item = {
      id: req.params.id,
      title: 'Example Item',
      price: 100,
      description: 'This is an example item',
      images: [],
      status: 'available',
      category: 'digital',
      condition: 'new',
      seller: {
        id: 1,
        name: 'admin',
        avatar: 'https://picsum.photos/200/311'
      },
      createdAt: new Date()
    }

    res.json({
      code: 200,
      data: item
    })
  } catch (error) {
    next(error)
  }
})

// Create item
router.post('/items', authMiddleware, async (req, res, next) => {
  try {
    const item = {
      id: Date.now(),
      ...req.body,
      // Ensure images is an array
      images: Array.isArray(req.body.images) ? req.body.images : [],
      seller: {
        id: req.user.id,
        name: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      },
      status: 'available',
      createdAt: new Date()
    }

    res.json({
      code: 200,
      data: item
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router 