<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-toolbar-title>Notification History</v-toolbar-title>
            <v-spacer />
            <v-btn
              v-if="hasUnread"
              variant="text"
              :loading="markingAll"
              @click="handleMarkAllRead"
            >
              Mark All as Read
            </v-btn>
          </v-toolbar>

          <!-- 通知列表 -->
          <v-list v-if="notifications.length">
            <template v-for="(notification, index) in notifications" :key="notification.id">
              <v-list-item
                :class="{ 'unread': !notification.isRead }"
                @click="handleClick(notification)"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getNotificationColor(notification.type)" size="40">
                    <v-icon color="white">{{ getNotificationIcon(notification.type) }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ notification.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ notification.content }}</v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex flex-column align-end">
                    <div class="text-caption">
                      {{ formatDate(notification.createdAt) }}
                    </div>
                    <v-chip
                      v-if="!notification.isRead"
                      size="x-small"
                      color="primary"
                      class="mt-1"
                    >
                      Unread
                    </v-chip>
                  </div>
                </template>
              </v-list-item>

              <v-divider
                v-if="index < notifications.length - 1"
                :key="`divider-${notification.id}`"
              />
            </template>
          </v-list>

          <!-- 空状态 -->
          <v-card-text v-else class="text-center py-8">
            <v-icon
              size="64"
              color="grey-lighten-1"
              class="mb-4"
            >
              mdi-bell-off
            </v-icon>
            <div class="text-grey">No Notifications</div>
          </v-card-text>

          <!-- 加载更多 -->
          <div
            v-if="hasMore"
            class="text-center py-2"
          >
            <v-btn
              v-if="!loading"
              variant="text"
              @click="loadMore"
            >
              Load More
            </v-btn>
            <v-progress-circular
              v-else
              indeterminate
              size="24"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import { notificationApi } from '@/api'

const router = useRouter()
const { showError } = useMessage()

// 状态
const notifications = ref([])
const loading = ref(false)
const markingAll = ref(false)
const hasMore = ref(false)
const page = ref(1)

// 计算属性
const hasUnread = computed(() => 
  notifications.value.some(n => !n.isRead)
)

// 获取通知图标
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

// 获取通知颜色
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

// 加载通知列表
const loadNotifications = async (isLoadMore = false) => {
  try {
    loading.value = true
    const { data, meta } = await notificationApi.getNotificationHistory({
      page: isLoadMore ? page.value + 1 : 1
    })

    if (isLoadMore) {
      notifications.value.push(...data)
      page.value++
    } else {
      notifications.value = data
      page.value = 1
    }

    hasMore.value = page.value < meta.lastPage
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadNotifications(true)
}

// 标记所有为已读
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

// 处理通知点击
const handleClick = async (notification) => {
  // 标记为已读
  if (!notification.isRead) {
    try {
      await notificationApi.markAsRead(notification.id)
      notification.isRead = true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // 跳转到相关页面
  if (notification.link) {
    router.push(notification.link)
  }
}

// 初始化
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style> 