<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :rail="rail" width="400">
      <template #default>
        <v-list>
          <v-list-item
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :prepend-icon="item.icon"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar>
      <template #default>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-toolbar-title>Campus Community</v-toolbar-title>
        
        <v-spacer />
        
        <v-btn
          icon
          class="mr-2"
          @click="showCalendar = true"
        >
          <v-icon>mdi-calendar</v-icon>
        </v-btn>
        
        <notification-list v-if="user" />
        
        <template v-if="!user">
          <v-btn to="/login" text>Login</v-btn>
        </template>
        <v-menu v-else>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" text class="user-btn">
              <div class="user-avatar mr-2">
                <img 
                  :src="userAvatar" 
                  :alt="userName"
                  class="avatar-img"
                />
              </div>
              <span>{{ userName }}</span>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleLogout">
              <v-list-item-title class="text-error">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </v-container>
    </v-main>

    <v-dialog
      v-model="showCalendar"
      max-width="1200"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          Course Calendar
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showCalendar = false"
          />
        </v-card-title>
        <v-card-text class="pa-0">
          <calendar />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import NotificationList from '@/components/common/NotificationList.vue'
import Calendar from '@/components/calendar/Calendar.vue'
import { useDisplay } from 'vuetify'

const display = useDisplay()
const drawer = ref(true)
const rail = ref(false)
const userStore = useUserStore()
const router = useRouter()

// 用户相关的计算属性
const user = computed(() => userStore.user)
const userAvatar = computed(() => user.value?.avatar || '/default-avatar.png') // 添加默认头像
const userName = computed(() => user.value?.name || 'User')

const menuItems = [
  { title: 'Home', icon: 'mdi-home', path: '/' },
  { title: 'Forum', icon: 'mdi-forum', path: '/forum' },
  { title: 'Chat', icon: 'mdi-chat', path: '/chat' },
  { title: 'Marketplace', icon: 'mdi-store', path: '/marketplace' },
  { title: 'Feedback', icon: 'mdi-message', path: '/feedback' },
  { title: 'Tourism', icon: 'mdi-map', path: '/tourism' }
]

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 响应式处理抽屉
watch(() => display.mdAndDown.value, (val) => {
  drawer.value = !val
  rail.value = val
})

// 调试用
watch(user, (newVal) => {
  console.log('User data changed:', newVal)
  console.log('Avatar URL:', userAvatar.value)
}, { immediate: true })

// 日历状态
const showCalendar = ref(false)
</script>

<style scoped>
.v-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
}

/* 用户按钮样式 */
.user-btn {
  height: 40px;
  padding: 0 12px;
}

.user-btn :deep(.v-btn__content) {
  display: flex;
  align-items: center;
}

.user-btn .v-avatar {
  margin-right: 8px;
}

/* 确保头像图片正确显示 */
.v-avatar :deep(.v-img) {
  width: 100%;
  height: 100%;
}

/* 自定义头像样式 */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style> 