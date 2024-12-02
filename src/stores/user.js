import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api'
import { ws } from '@/utils/websocket'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)

  // 初始化用户信息
  const initUser = async () => {
    if (token.value) {
      try {
        const data = await userApi.getUserInfo()
        user.value = data
        // 连接WebSocket
        ws.connect(token.value)
      } catch (error) {
        console.error('Failed to get user info:', error)
        // 如果token无效，清除登录状态
        logout()
      }
    }
  }

  // 登录
  const login = async (credentials) => {
    const { data } = await userApi.login(credentials)
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    
    // 连接WebSocket
    ws.connect(data.token)

    // 如果有重定向地址，跳转到该地址
    const redirect = router.currentRoute.value.query.redirect
    router.push(redirect || '/')
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    ws.disconnect()
    router.push('/login')
  }

  return {
    user,
    token,
    isLoggedIn,
    initUser,
    login,
    logout
  }
}) 