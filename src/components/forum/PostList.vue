<template>
  <div class="post-list">
    <!-- 帖子卡片 -->
    <v-card
      v-for="post in posts"
      :key="post.id"
      class="mb-4"
      :to="`/forum/post/${post.id}`"
      hover
    >
      <v-card-title class="d-flex align-center">
        <div class="text-h6 text-truncate">{{ post.title }}</div>
        <v-chip
          v-if="post.category"
          size="small"
          class="ml-2"
          color="primary"
          variant="flat"
        >
          {{ post.category.name }}
        </v-chip>
      </v-card-title>

      <v-card-subtitle class="d-flex align-center">
        <v-avatar size="24" class="mr-2">
          <v-img :src="post.author.avatar" />
        </v-avatar>
        {{ post.author.name }}
        <v-icon size="small" class="mx-1">mdi-circle-small</v-icon>
        {{ formatDate(post.createdAt) }}
      </v-card-subtitle>

      <v-card-text>
        <div class="text-body-1 text-truncate-3">{{ post.preview }}</div>
        
        <!-- 图片预览 -->
        <v-row v-if="post.images?.length" class="mt-2">
          <v-col
            v-for="(image, index) in post.images.slice(0, 3)"
            :key="index"
            cols="4"
          >
            <v-img
              :src="image"
              aspect-ratio="1"
              cover
              class="rounded-lg"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn
          variant="text"
          prepend-icon="mdi-thumb-up"
          :color="post.isLiked ? 'primary' : ''"
          @click.stop="handleLike(post)"
        >
          {{ post.likes }}
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-comment"
        >
          {{ post.comments }}
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-eye"
        >
          {{ post.views }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 空状态 -->
    <div v-if="!loading && !posts.length" class="text-center text-grey pa-4">
      No Posts
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import { postApi } from '@/api'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

const emit = defineEmits(['refresh'])
const userStore = useUserStore()
const { showMessage, showError } = useMessage()

// 处理点赞
const handleLike = async (post) => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    await postApi.likePost(post.id)
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
    showMessage(post.isLiked ? 'Liked successfully' : 'Like removed')
  } catch (error) {
    showError(error)
  }
}
</script>

<style scoped>
.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 