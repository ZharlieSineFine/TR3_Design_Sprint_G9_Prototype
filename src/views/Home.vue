<template>
  <v-container>
    <v-row>
      <!-- 热门板块 -->
      <v-col cols="12">
        <v-card>
          <v-card-title>Popular Sections</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="section in sections" :key="section.id" cols="12" sm="6" md="4">
                <v-card :to="section.path" hover>
                  <v-card-title>
                    <v-icon :icon="section.icon" class="mr-2" />
                    {{ section.title }}
                  </v-card-title>
                  <v-card-text>{{ section.description }}</v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 最新动态 -->
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            Latest Updates
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              to="/forum"
            >
              View More
            </v-btn>
          </v-card-title>

          <v-list v-if="activities.length">
            <template v-for="(activity, index) in activities" :key="activity.id">
              <v-list-item
                :to="getActivityLink(activity)"
                class="activity-item"
              >
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <v-img :src="activity.author.avatar" />
                  </v-avatar>
                </template>

                <v-list-item-title class="text-subtitle-1">
                  {{ activity.title }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  <div class="d-flex align-center mt-1">
                    <span class="text-primary">{{ activity.author.name }}</span>
                    <v-icon size="small" class="mx-1">mdi-circle-small</v-icon>
                    <span class="text-grey">{{ formatDate(activity.createdAt) }}</span>
                    
                    <v-spacer />
                    
                    <!-- 统计信息 -->
                    <div class="d-flex align-center">
                      <v-icon size="small" color="grey">mdi-eye</v-icon>
                      <span class="text-caption text-grey ml-1 mr-2">{{ activity.stats.views }}</span>
                      
                      <v-icon size="small" color="grey">mdi-thumb-up</v-icon>
                      <span class="text-caption text-grey ml-1 mr-2">{{ activity.stats.likes }}</span>
                      
                      <v-icon size="small" color="grey">mdi-comment</v-icon>
                      <span class="text-caption text-grey ml-1">{{ activity.stats.comments }}</span>
                    </div>
                  </div>
                </v-list-item-subtitle>

                <!-- 活动类型标签 -->
                <template v-slot:append>
                  <v-chip
                    size="small"
                    :color="getActivityColor(activity.type)"
                    class="text-capitalize"
                  >
                    {{ getActivityType(activity.type) }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-divider
                v-if="index < activities.length - 1"
                :key="`divider-${activity.id}`"
              />
            </template>
          </v-list>

          <v-card-text v-else class="text-center py-4">
            <v-icon
              size="40"
              color="grey-lighten-1"
              class="mb-2"
            >
              mdi-information
            </v-icon>
            <div class="text-grey">No activities yet</div>
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

      <!-- 侧边栏 -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>Announcements</v-card-title>
          <v-list>
            <v-list-item
              v-for="notice in notices"
              :key="notice.id"
              :title="notice.title"
              :subtitle="formatDate(notice.date)"
            />
          </v-list>
        </v-card>

        <v-card>
          <v-card-title>Active Users</v-card-title>
          <v-list>
            <v-list-item
              v-for="user in activeUsers"
              :key="user.id"
              :title="user.name"
            >
              <template v-slot:prepend>
                <v-avatar size="32">
                  <v-img :src="user.avatar" />
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/date'
import { useMessage } from '@/utils/message'

const { showError } = useMessage()

const sections = ref([
  {
    id: 1,
    title: 'Knowledge Forum',
    description: 'Share learning experiences, exchange professional knowledge',
    icon: 'mdi-forum',
    path: '/forum'
  },
  {
    id: 2,
    title: 'Marketplace',
    description: 'Second-hand items trading, sharing discount information',
    icon: 'mdi-store',
    path: '/marketplace'
  },
  {
    id: 3,
    title: 'Local Tourism',
    description: 'Explore the campus area, discover exciting attractions',
    icon: 'mdi-map',
    path: '/tourism'
  }
])

// 状态
const activities = ref([])
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)

// 获取活动类型文本
const getActivityType = (type) => {
  const types = {
    question: 'Question',
    article: 'Article',
    marketplace: 'Marketplace',
    announcement: 'Announcement',
    share: 'Share',
    activity: 'Activity',
    review: 'Review',
    experience: '经验',
    notice: '通知'
  }
  return types[type] || type
}

// 获取活动类型颜色
const getActivityColor = (type) => {
  const colors = {
    question: 'info',
    article: 'primary',
    marketplace: 'success',
    announcement: 'warning',
    share: 'purple',
    activity: 'pink',
    review: 'orange',
    experience: 'cyan',
    notice: 'grey'
  }
  return colors[type] || 'grey'
}

// 获取活动链接
const getActivityLink = (activity) => {
  const links = {
    question: `/forum/post/${activity.id}`,
    article: `/forum/post/${activity.id}`,
    marketplace: `/marketplace`,
    announcement: `/forum/post/${activity.id}`,
    share: `/forum/post/${activity.id}`,
    activity: `/forum/post/${activity.id}`,
    review: `/forum/post/${activity.id}`,
    experience: `/forum/post/${activity.id}`,
    notice: `/forum/post/${activity.id}`
  }
  return links[activity.type] || '/forum'
}

// 加载活动数据
const loadActivities = async (isLoadMore = false) => {
  try {
    loading.value = true
    const response = await fetch(`/api/activities?page=${page.value}`)
    const { code, data, meta } = await response.json()
    
    if (code === 200) {
      if (isLoadMore) {
        activities.value.push(...data)
        page.value++
      } else {
        activities.value = data
        page.value = 1
      }
      hasMore.value = page.value < meta.lastPage
    }
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadActivities(true)
}

// 初始化
onMounted(() => {
  loadActivities()
})

const notices = ref([
  {
    id: 1,
    title: 'Notice on Final Exam Arrangements',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
])

const activeUsers = ref([
  {
    id: 1,
    name: 'Learning Expert',
    avatar: '/avatars/1.jpg'
  }
])
</script>

<style scoped>
.activity-item {
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style> 