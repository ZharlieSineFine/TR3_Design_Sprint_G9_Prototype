import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('../views/Forum.vue'),
    meta: { title: '论坛' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import(/* webpackChunkName: "chat" */ '../views/Chat.vue'),
    meta: { 
      title: '聊天',
      requiresAuth: true,
      keepAlive: true
    }
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: () => import('../views/Marketplace.vue'),
    meta: { title: '二手市场' }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/Feedback.vue'),
    meta: { title: '反馈' }
  },
  {
    path: '/tourism',
    name: 'Tourism',
    component: () => import('../views/Tourism.vue'),
    meta: { title: '旅游' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/forum/post/:id',
    name: 'PostDetail',
    component: () => import('../views/PostDetail.vue'),
    meta: { title: '帖子详情' }
  },
  {
    path: '/notifications',
    name: 'NotificationHistory',
    component: () => import('../views/NotificationHistory.vue'),
    meta: { 
      title: '通知历史',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { 
      title: '个人资料',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 校园社区`

  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // 检查是否需要登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 如果已登录且访问登录页，重定向到首页
  if (isLoggedIn && to.name === 'Login') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router 