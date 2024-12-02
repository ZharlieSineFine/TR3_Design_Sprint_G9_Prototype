<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <!-- Post Content -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">{{ post.title }}</v-card-title>
          <v-card-subtitle>
            <v-avatar size="32" class="mr-2">
              <v-img :src="post.author.avatar" />
            </v-avatar>
            {{ post.author.name }} · {{ formatDate(post.createdAt) }}
          </v-card-subtitle>
          <v-card-text class="text-body-1">
            <div v-html="post.content" class="rich-content"></div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              variant="text"
              prepend-icon="mdi-thumb-up"
              :color="post.isLiked ? 'primary' : ''"
              @click="handleLike"
            >
              {{ post.likes }}
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-bookmark"
              :color="post.isCollected ? 'primary' : ''"
              @click="handleCollect"
            >
              Collect
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-share"
              @click="handleShare"
            >
              Share
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Comment Section -->
        <v-card>
          <v-card-title>Comments ({{ comments.length }})</v-card-title>
          
          <!-- Comment Input -->
          <v-card-text>
            <v-textarea
              v-model="newComment"
              label="Write your comment"
              rows="3"
              auto-grow
              hide-details
            />
            <div class="d-flex justify-end mt-2">
              <v-btn
                color="primary"
                :disabled="!newComment.trim()"
                :loading="submitting"
                @click="handleComment"
              >
                Post Comment
              </v-btn>
            </div>
          </v-card-text>

          <!-- Comment List -->
          <v-list>
            <template v-for="comment in comments" :key="comment.id">
              <!-- Main Comment -->
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <v-img :src="comment.author.avatar" />
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{ comment.author.name }}
                  <span class="text-caption text-grey">
                    · {{ formatDate(comment.createdAt) }}
                  </span>
                </v-list-item-title>
                
                <v-list-item-subtitle class="mt-2 text-body-1">
                  {{ comment.content }}
                </v-list-item-subtitle>

                <v-list-item-subtitle class="mt-2">
                  <v-btn
                    variant="text"
                    size="small"
                    prepend-icon="mdi-thumb-up"
                    :color="comment.isLiked ? 'primary' : ''"
                    @click="handleLikeComment(comment)"
                  >
                    {{ comment.likes }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    size="small"
                    @click="handleReply(comment)"
                  >
                    Reply
                  </v-btn>
                </v-list-item-subtitle>
              </v-list-item>

              <!-- Reply List -->
              <v-list-item
                v-for="reply in comment.replies"
                :key="reply.id"
                class="pl-16"
              >
                <template v-slot:prepend>
                  <v-avatar size="32">
                    <v-img :src="reply.author.avatar" />
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{ reply.author.name }}
                  <span class="text-caption text-grey">
                    Reply to {{ reply.replyTo.name }}
                    · {{ formatDate(reply.createdAt) }}
                  </span>
                </v-list-item-title>
                
                <v-list-item-subtitle class="mt-2">
                  {{ reply.content }}
                </v-list-item-subtitle>

                <v-list-item-subtitle class="mt-2">
                  <v-btn
                    variant="text"
                    size="small"
                    prepend-icon="mdi-thumb-up"
                    :color="reply.isLiked ? 'primary' : ''"
                    @click="handleLikeReply(comment.id, reply)"
                  >
                    {{ reply.likes }}
                  </v-btn>
                  <v-btn
                    variant="text"
                    size="small"
                    @click="handleReply(comment, reply)"
                  >
                    Reply
                  </v-btn>
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-list>

          <!-- Share Dialog -->
          <share-dialog ref="shareDialog" />
        </v-card>
      </v-col>

      <!-- Related Recommendations -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Related Posts</v-card-title>
          <v-list>
            <v-list-item
              v-for="relatedPost in relatedPosts"
              :key="relatedPost.id"
              :to="`/forum/post/${relatedPost.id}`"
            >
              <v-list-item-title>{{ relatedPost.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ relatedPost.author.name }} · {{ formatDate(relatedPost.createdAt) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatDate } from '@/utils/date'
import { useUserStore } from '@/stores/user'
import { postApi, commentApi } from '@/api'
import { useMessage } from '@/utils/message'
import ShareDialog from '@/components/common/ShareDialog.vue'

const route = useRoute()
const userStore = useUserStore()
const submitting = ref(false)
const newComment = ref('')
const { showMessage, showError } = useMessage()

// Pagination related states
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const hasMore = computed(() => comments.value.length < total.value)

// Simulated post data
const post = reactive({
  id: route.params.id,
  title: 'Recommended Computer Science Books',
  content: 'Looking to systematically learn computer science fundamentals, please recommend some classic CS books...',
  author: {
    name: 'Learning Expert',
    avatar: '/avatars/1.jpg'
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 30),
  likes: 42,
  isLiked: false,
  isCollected: false
})

// Simulated comment data
const comments = ref([
  {
    id: 1,
    content: 'I recommend "Introduction to Algorithms", it\'s a classic CS textbook',
    author: {
      name: 'Algorithm Enthusiast',
      avatar: '/avatars/2.jpg'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: 1,
        content: 'Agree, this book is very detailed',
        author: {
          name: 'CS Lover',
          avatar: '/avatars/3.jpg'
        },
        replyTo: {
          name: 'Algorithm Enthusiast'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 10),
        likes: 2,
        isLiked: false
      }
    ]
  }
])

// Simulated related posts
const relatedPosts = ref([
  {
    id: 2,
    title: 'Sharing My CS Course Learning Experience',
    author: {
      name: 'Top Student',
      avatar: '/avatars/3.jpg'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60)
  }
])

// Get post detail
const getPostDetail = async () => {
  try {
    const data = await postApi.getPostDetail(route.params.id)
    Object.assign(post, data)
  } catch (error) {
    showError(error)
  }
}

// Get comment list
const getComments = async (isLoadMore = false) => {
  try {
    loading.value = true
    const { data, meta } = await commentApi.getComments(route.params.id, {
      page: page.value,
      pageSize: pageSize.value
    })
    
    if (isLoadMore) {
      comments.value.push(...data)
    } else {
      comments.value = data
    }
    
    total.value = meta.total
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// Load more comments
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  getComments(true)
}

// Handle like
const handleLike = async () => {
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

// Handle collect
const handleCollect = async () => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    await postApi.collectPost(post.id)
    post.isCollected = !post.isCollected
    showMessage(post.isCollected ? 'Collected successfully' : 'Uncollected')
  } catch (error) {
    showError(error)
  }
}

const shareDialog = ref(null)
const handleShare = () => {
  shareDialog.value?.openShare(window.location.href)
}

// Handle comment
const handleComment = async () => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    submitting.value = true
    await commentApi.createComment(post.id, {
      content: newComment.value
    })
    
    // Reset comment list
    page.value = 1
    await getComments()
    newComment.value = ''
    showMessage('Comment posted successfully')
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// Handle comment like
const handleLikeComment = async (comment) => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    await commentApi.likeComment(post.id, comment.id)
    comment.isLiked = !comment.isLiked
    comment.likes += comment.isLiked ? 1 : -1
    showMessage(comment.isLiked ? 'Liked successfully' : 'Like removed')
  } catch (error) {
    showError(error)
  }
}

const handleReply = (comment, reply = null) => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }
  
  const replyTo = reply?.author.name || comment.author.name
  newComment.value = `@${replyTo} `
}

// Handle reply like
const handleLikeReply = async (commentId, reply) => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    await commentApi.likeReply(post.id, commentId, reply.id)
    reply.isLiked = !reply.isLiked
    reply.likes += reply.isLiked ? 1 : -1
    showMessage(reply.isLiked ? 'Liked successfully' : 'Like removed')
  } catch (error) {
    showError(error)
  }
}

onMounted(() => {
  getPostDetail()
  getComments()
})
</script> 

<style scoped>
.rich-content {
  /* Add some basic styles */
  line-height: 1.6;
}

.rich-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.rich-content :deep(blockquote) {
  border-left: 4px solid #ccc;
  margin: 1em 0;
  padding-left: 1em;
}

.rich-content :deep(pre) {
  background: #f4f4f4;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 