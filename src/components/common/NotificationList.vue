<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false"
    location="bottom end"
    offset="10"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        icon
        v-bind="props"
        class="mr-2"
      >
        <v-badge
          :content="unreadCount || ''"
          :model-value="!!unreadCount"
          color="error"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="300" max-width="400">
      <v-toolbar density="compact">
        <v-toolbar-title>Notifications</v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="hasUnread"
          variant="text"
          density="compact"
          :loading="markingAll"
          @click="handleMarkAllRead"
        >
          Mark All as Read
        </v-btn>
      </v-toolbar>

      <div class="notification-items">
        <v-list v-if="notifications.length">
          <template v-for="(notification, index) in notifications" :key="notification.id">
            <v-list-item
              :class="{ 'unread': !notification.isRead }"
              @click="handleClick(notification)"
            >
              <template v-slot:prepend>
                <v-avatar :color="getNotificationColor(notification.type)" size="32">
                  <v-icon color="white" size="small">
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-subtitle-2">
                {{ notification.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ formatDate(notification.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider
              v-if="index < notifications.length - 1"
              :key="`divider-${notification.id}`"
            />
          </template>
        </v-list>

        <div v-else class="text-center py-4 text-grey">
          No Notifications
        </div>
      </div>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          to="/notifications"
          @click="showMenu = false"
        >
          View All
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import { notificationApi } from '@/api'

const router = useRouter()
const { showError } = useMessage()

// State
const showMenu = ref(false)
const notifications = ref([])
const loading = ref(false)
const markingAll = ref(false)

// Computed Properties
const unreadCount = computed(() => 
  notifications.value?.filter(n => !n.isRead).length || 0
)

const hasUnread = computed(() => unreadCount.value > 0)

// Load Notification List
const loadNotifications = async () => {
  try {
    loading.value = true
    const { data } = await notificationApi.getNotifications()
    notifications.value = data || []
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    loading.value = false
  }
}

// Mark a Single Notification as Read
const markAsRead = async (notification) => {
  if (notification.isRead) return

  try {
    await notificationApi.markAsRead(notification.id)
    notification.isRead = true
  } catch (error) {
    showError(error)
  }
}

// Mark All Notifications as Read
const handleMarkAllRead = async () => {
  try {
    markingAll.value = true
    await notificationApi.markAllAsRead()
    notifications.value.forEach(n => n.isRead = true)
  } catch (error) {
    showError(error)
  } finally {
    markingAll.value = false
  }
}

// Handle Notification Click
const handleClick = (notification) => {
  if (!notification.isRead) {
    markAsRead(notification)
  }
  
  if (notification.link) {
    router.push(notification.link)
    showMenu.value = false
  }
}

// Get Notification Icon
const getNotificationIcon = (type) => {
  const icons = {
    system: 'mdi-information',
    like: 'mdi-thumb-up',
    comment: 'mdi-comment',
    follow: 'mdi-account-plus',
    mention: 'mdi-at'
  }
  return icons[type] || 'mdi-bell'
}

// Get Notification Color
const getNotificationColor = (type) => {
  const colors = {
    system: 'info',
    like: 'pink',
    comment: 'primary',
    follow: 'success',
    mention: 'purple'
  }
  return colors[type] || 'grey'
}

// Poll Notifications
let pollTimer = null
const startPolling = () => {
  pollTimer = setInterval(loadNotifications, 30000) // Poll every 30 seconds
}

// Lifecycle Hooks
onMounted(() => {
  loadNotifications()
  startPolling()
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<style scoped>
.notification-items {
  max-height: 400px;
  overflow-y: auto;
}

.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style> 