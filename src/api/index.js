import axios from 'axios'
import router from '@/router'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Clear login status
      localStorage.removeItem('token')
      // Redirect to login page
      const currentRoute = router.currentRoute.value
      if (currentRoute.name !== 'Login') {
        router.push({
          name: 'Login',
          query: { redirect: currentRoute.fullPath }
        })
      }
    }
    return Promise.reject(error)
  }
)

// Post related interfaces
export const postApi = {
  // Get post list
  getPosts(params) {
    return api.get('/posts', { params })
  },
  
  // Get post details
  getPostDetail(id) {
    return api.get(`/posts/${id}`)
  },
  
  // Create post
  createPost(data) {
    return api.post('/posts', data)
  },
  
  // Like post
  likePost(id) {
    return api.post(`/posts/${id}/like`)
  },
  
  // Collect post
  collectPost(id) {
    return api.post(`/posts/${id}/collect`)
  }
}

// Comment related interfaces
export const commentApi = {
  // Get comment list
  getComments(postId, params) {
    return api.get(`/posts/${postId}/comments`, { params }).then(res => ({
      data: res.data,
      meta: {
        total: res.meta.total,
        currentPage: res.meta.current_page,
        lastPage: res.meta.last_page
      }
    }))
  },
  
  // Post comment
  createComment(postId, data) {
    return api.post(`/posts/${postId}/comments`, data)
  },
  
  // Like comment
  likeComment(postId, commentId) {
    return api.post(`/posts/${postId}/comments/${commentId}/like`)
  },
  
  // Like reply
  likeReply(postId, commentId, replyId) {
    return api.post(`/posts/${postId}/comments/${commentId}/replies/${replyId}/like`)
  },
  
  // Reply to comment
  createReply(postId, commentId, data) {
    return api.post(`/posts/${postId}/comments/${commentId}/replies`, data)
  }
}

// User related interfaces
export const userApi = {
  // Login
  login(data) {
    return api.post('/auth/login', data)
  },
  
  // Register
  register(data) {
    return api.post('/auth/register', data)
  },
  
  // Get user information
  getUserInfo() {
    return api.get('/auth/user/info')
  },
  
  // Get user information
  getUserInfo() {
    return api.get('/users/me')
  },
  
  // Update profile
  updateProfile(data) {
    return api.put('/users/profile', data)
  },
  
  // Change password
  changePassword(data) {
    return api.put('/users/password', data)
  },
  
  // Upload avatar
  uploadAvatar(formData) {
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// Report related interfaces
export const reportApi = {
  // Submit report
  createReport(data) {
    return api.post('/reports', data)
  },
  
  // Get report history
  getReports(params) {
    return api.get('/reports', { params })
  }
}

// Notification related interfaces
export const notificationApi = {
  // Get notification list
  getNotifications(params) {
    return api.get('/notifications', { params })
  },
  
  // Mark notification as read
  markAsRead(id) {
    return api.post(`/notifications/${id}/read`)
  },
  
  // Mark all notifications as read
  markAllAsRead() {
    return api.post('/notifications/read-all')
  },
  
  // Get unread notification count
  getUnreadCount() {
    return api.get('/notifications/unread-count')
  },
  
  // Revoke notification
  revokeNotification(id) {
    return api.post(`/notifications/${id}/revoke`)
  },
  
  // Delete notification
  deleteNotification(id) {
    return api.delete(`/notifications/${id}`)
  },
  
  // Get notification history
  getNotificationHistory(params) {
    return api.get('/notifications/history', { params })
  }
}

// Second-hand market related interfaces
export const marketplaceApi = {
  // Get item list
  getItems(params) {
    return api.get('/marketplace/items', { params })
  },

  // Get item details
  getItemDetail(id) {
    return api.get(`/marketplace/items/${id}`)
  },

  // Create item
  createItem(data) {
    return api.post('/marketplace/items', data)
  },

  // Update item
  updateItem(id, data) {
    return api.put(`/marketplace/items/${id}`, data)
  },

  // Delete item
  deleteItem(id) {
    return api.delete(`/marketplace/items/${id}`)
  },

  // Collect item
  collectItem(id) {
    return api.post(`/marketplace/items/${id}/collect`)
  },

  // Uncollect item
  uncollectItem(id) {
    return api.delete(`/marketplace/items/${id}/collect`)
  }
}

// Chat related interfaces
export const chatApi = {
  // Get chat list
  getChats() {
    return api.get('/chats')
  },

  // Create chat
  createChat(targetId) {
    return api.post('/chats', { targetId })
  },

  // Get message list
  getMessages(chatId, params) {
    return api.get(`/chats/${chatId}/messages`, { params })
  },

  // Send message
  sendMessage(chatId, message) {
    return api.post(`/chats/${chatId}/messages`, message)
  },

  // Revoke message
  revokeMessage(chatId, messageId) {
    return api.post(`/chats/${chatId}/messages/${messageId}/revoke`)
  },

  // Mark as read
  markAsRead(chatId) {
    return api.post(`/chats/${chatId}/read`)
  }
}

// Group chat related interfaces
export const groupApi = {
  // Get group list
  getGroups() {
    return api.get('/groups')
  },

  // Create group
  createGroup(data) {
    return api.post('/groups', data)
  },

  // Get group details
  getGroupDetail(id) {
    return api.get(`/groups/${id}`)
  },

  // Update group information
  updateGroup(id, data) {
    return api.put(`/groups/${id}`, data)
  },

  // Disband group
  deleteGroup(id) {
    return api.delete(`/groups/${id}`)
  },

  // Get group members
  getMembers(groupId) {
    return api.get(`/groups/${groupId}/members`)
  },

  // Add group members
  addMembers(groupId, userIds) {
    return api.post(`/groups/${groupId}/members`, { userIds })
  },

  // Remove group member
  removeMember(groupId, userId) {
    return api.delete(`/groups/${groupId}/members/${userId}`)
  },

  // Leave group
  leaveGroup(groupId) {
    return api.post(`/groups/${groupId}/leave`)
  },

  // Get group messages
  getMessages(groupId, params) {
    return api.get(`/groups/${groupId}/messages`, { params })
  },

  // Send group message
  sendMessage(groupId, message) {
    return api.post(`/groups/${groupId}/messages`, message)
  },

  // Revoke group message
  revokeMessage(groupId, messageId) {
    return api.post(`/groups/${groupId}/messages/${messageId}/revoke`)
  }
}

// Upload related interfaces
export const uploadApi = {
  // Upload image
  uploadImage(formData) {
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Upload file
  uploadFile(formData) {
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Delete file
  deleteFile(fileUrl) {
    return api.delete('/upload/file', {
      params: { url: fileUrl }
    })
  }
} 