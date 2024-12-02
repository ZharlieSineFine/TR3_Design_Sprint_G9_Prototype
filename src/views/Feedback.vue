<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5 py-4">
            Feedback
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showFeedbackDialog = true"
            >
              Submit Feedback
            </v-btn>
          </v-card-title>

          <!-- 空状态提示 -->
          <div v-if="!feedbacks.length" class="text-center text-grey pa-4">
            No feedback yet
          </div>

          <!-- 反馈列表 -->
          <v-list>
            <v-list-item
              v-for="feedback in feedbacks"
              :key="feedback.id"
              :class="{ 'has-reply': feedback.reply }"
            >
              <template v-slot:prepend>
                <v-avatar size="40">
                  <v-img :src="feedback.user.avatar" />
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ feedback.title }}
                <v-chip
                  size="small"
                  :color="getStatusColor(feedback.status)"
                  class="ml-2"
                >
                  {{ getStatusText(feedback.status) }}
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="mt-2">
                {{ feedback.content }}
              </v-list-item-subtitle>

              <!-- 反馈回复 -->
              <div v-if="feedback.reply" class="reply-content mt-2">
                <div class="reply-header">
                  <v-avatar size="24" class="mr-2">
                    <v-img :src="feedback.reply.user.avatar" />
                  </v-avatar>
                  <span class="text-caption">
                    {{ feedback.reply.user.name }}
                    replied on
                    {{ formatDate(feedback.reply.createdAt) }}
                  </span>
                </div>
                <div class="reply-text">
                  {{ feedback.reply.content }}
                </div>
              </div>

              <v-list-item-subtitle class="mt-1 text-caption">
                Submitted on {{ formatDate(feedback.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <!-- 加载更多按钮 -->
          <v-btn
            variant="text"
            @click="loadMore"
          >
            Load More
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- 提交反馈对话框 -->
    <v-dialog v-model="showFeedbackDialog" max-width="600">
      <v-card>
        <v-card-title>Submit Feedback</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="form.title"
              label="Title"
              :rules="[v => !!v || 'Please enter a title']"
              required
            />

            <v-select
              v-model="form.type"
              :items="feedbackTypes"
              label="Feedback Type"
              :rules="[v => !!v || 'Please select a feedback type']"
              required
            />

            <v-textarea
              v-model="form.content"
              label="Feedback Content"
              :rules="[v => !!v || 'Please enter feedback content']"
              required
              auto-grow
              rows="4"
            />

            <image-upload
              v-model:images="form.images"
              :max-count="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showFeedbackDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import ImageUpload from '@/components/common/ImageUpload.vue'

const { showMessage, showError } = useMessage()

// 状态
const feedbacks = ref([])
const loading = ref(false)
const hasMore = ref(false)
const page = ref(1)
const showFeedbackDialog = ref(false)
const submitting = ref(false)

// 表单数据
const form = ref({
  title: '',
  type: null,
  content: '',
  images: []
})

// 选项
const feedbackTypes = [
  { title: 'Feature Suggestions', value: 'feature' },
  { title: 'BUG Feedback', value: 'bug' },
  { title: 'Experience Optimization', value: 'experience' },
  { title: 'Others', value: 'other' }
]

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    processing: 'info',
    resolved: 'success',
    rejected: 'error'
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    processing: 'Processing',
    resolved: 'Resolved',
    rejected: 'Rejected'
  }
  return texts[status] || status
}

// 加载反馈列表
const loadFeedbacks = async (isLoadMore = false) => {
  try {
    loading.value = true
    // 这里应该调用后端API
    const mockData = {
      data: [
        {
          id: 1,
          title: 'Request for Dark Mode',
          content: 'Suggest adding dark mode for better eye protection at night',
          type: 'feature',
          status: 'processing',
          images: [],
          user: {
            id: 1,
            name: 'User A',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
          },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          reply: {
            content: 'Thank you for your feedback, we are developing this feature',
            user: {
              id: 999,
              name: 'Admin',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
            },
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        },
        {
          id: 2,
          title: 'Found a login bug',
          content: 'Login failure may occur in certain situations',
          type: 'bug',
          status: 'resolved',
          images: [],
          user: {
            id: 2,
            name: 'User B',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          reply: null
        }
      ],
      meta: {
        total: 10,
        currentPage: 1,
        lastPage: 2
      }
    }

    if (isLoadMore) {
      feedbacks.value.push(...mockData.data)
      page.value++
    } else {
      feedbacks.value = mockData.data
      page.value = 1
    }

    hasMore.value = page.value < mockData.meta.lastPage
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadFeedbacks(true)
}

// 提交反馈
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.title.trim()) {
    showMessage('Please enter a title', 'warning')
    return
  }

  if (!form.value.type) {
    showMessage('Please select a feedback type', 'warning')
    return
  }

  if (!form.value.content.trim()) {
    showMessage('Please enter feedback content', 'warning')
    return
  }

  try {
    submitting.value = true
    // 这里应该调用后端API
    await new Promise(resolve => setTimeout(resolve, 1000))
    showMessage('Submission successful')
    showFeedbackDialog.value = false
    loadFeedbacks()
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  loadFeedbacks()
})
</script>

<style scoped>
.has-reply {
  border-left: 3px solid var(--v-theme-primary);
}

.reply-content {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 8px;
  margin-left: 48px;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.reply-text {
  color: rgba(0, 0, 0, 0.87);
}
</style> 