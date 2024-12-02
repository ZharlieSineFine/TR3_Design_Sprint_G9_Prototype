<template>
  <v-container>
    <v-row>
      <!-- User Information Card -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <v-avatar size="120" class="mb-4">
              <v-img :src="userInfo.avatar" />
            </v-avatar>
            <h2 class="text-h5 mb-2">{{ userInfo.name }}</h2>
            <p class="text-body-2 text-grey">{{ userInfo.bio || 'This person is too lazy to write anything~' }}</p>
            
            <v-divider class="my-4" />
            
            <v-row>
              <v-col>
                <div class="text-h6">{{ userInfo.posts }}</div>
                <div class="text-caption text-grey">Posts</div>
              </v-col>
              <v-col>
                <div class="text-h6">{{ userInfo.followers }}</div>
                <div class="text-caption text-grey">Followers</div>
              </v-col>
              <v-col>
                <div class="text-h6">{{ userInfo.following }}</div>
                <div class="text-caption text-grey">Following</div>
              </v-col>
            </v-row>
            
            <v-btn
              v-if="isCurrentUser"
              color="primary"
              block
              class="mt-4"
              @click="showEditDialog = true"
            >
              Edit Profile
            </v-btn>
            <v-btn
              v-else
              :color="userInfo.isFollowing ? 'grey' : 'primary'"
              block
              class="mt-4"
              @click="handleFollow"
            >
              {{ userInfo.isFollowing ? 'Unfollow' : 'Follow' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- User Activity -->
      <v-col cols="12" md="8">
        <v-card>
          <v-tabs v-model="currentTab">
            <v-tab value="posts">Posts</v-tab>
            <v-tab value="comments">Comments</v-tab>
            <v-tab value="likes">Likes</v-tab>
            <v-tab value="collections">Collections</v-tab>
          </v-tabs>

          <v-window v-model="currentTab">
            <!-- Post List -->
            <v-window-item value="posts">
              <post-list
                :posts="posts"
                :loading="loading"
                :has-more="hasMore"
                @load-more="loadMore"
              />
            </v-window-item>

            <!-- Comment List -->
            <v-window-item value="comments">
              <v-list>
                <v-list-item
                  v-for="comment in comments"
                  :key="comment.id"
                  :to="`/forum/post/${comment.postId}`"
                >
                  <v-list-item-title>{{ comment.content }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Commented on {{ formatDate(comment.createdAt) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- Like List -->
            <v-window-item value="likes">
              <post-list
                :posts="likedPosts"
                :loading="loading"
                :has-more="hasMore"
                @load-more="loadMore"
              />
            </v-window-item>

            <!-- Collection List -->
            <v-window-item value="collections">
              <post-list
                :posts="collectedPosts"
                :loading="loading"
                :has-more="hasMore"
                @load-more="loadMore"
              />
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title>Edit Profile</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-file-input
              v-model="form.avatar"
              label="Avatar"
              accept="image/*"
              prepend-icon="mdi-camera"
              show-size
            />
            
            <v-text-field
              v-model="form.name"
              label="Username"
              required
            />
            
            <v-textarea
              v-model="form.bio"
              label="Bio"
              rows="3"
              counter
              maxlength="200"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showEditDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import { userApi } from '@/api'
import PostList from '@/components/forum/PostList.vue'

const route = useRoute()
const userStore = useUserStore()
const { showMessage, showError } = useMessage()

const loading = ref(false)
const submitting = ref(false)
const showEditDialog = ref(false)
const currentTab = ref('posts')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// User Data
const userInfo = ref({
  id: '',
  name: '',
  avatar: '',
  bio: '',
  posts: 0,
  followers: 0,
  following: 0,
  isFollowing: false
})

// List Data
const posts = ref([])
const comments = ref([])
const likedPosts = ref([])
const collectedPosts = ref([])

// Edit Form
const form = ref({
  avatar: null,
  name: '',
  bio: ''
})

// Is Current User
const isCurrentUser = computed(() => 
  userInfo.value.id === userStore.user?.id
)

// Has More Data
const hasMore = computed(() => {
  const list = {
    posts: posts,
    comments: comments,
    likes: likedPosts,
    collections: collectedPosts
  }[currentTab.value]
  
  return list.value.length < total.value
})

// Load User Info
const loadUserInfo = async () => {
  try {
    const data = await userApi.getUserProfile(route.params.id)
    userInfo.value = data
  } catch (error) {
    showError(error)
  }
}

// Load List Data
const loadData = async (isLoadMore = false) => {
  if (loading.value) return
  
  try {
    loading.value = true
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    let data, meta
    switch (currentTab.value) {
      case 'posts':
        ({ data, meta } = await userApi.getUserPosts(userInfo.value.id, params))
        if (isLoadMore) {
          posts.value.push(...data)
        } else {
          posts.value = data
        }
        break
      case 'comments':
        ({ data, meta } = await userApi.getUserComments(userInfo.value.id, params))
        if (isLoadMore) {
          comments.value.push(...data)
        } else {
          comments.value = data
        }
        break
      case 'likes':
        ({ data, meta } = await userApi.getUserLikes(userInfo.value.id, params))
        if (isLoadMore) {
          likedPosts.value.push(...data)
        } else {
          likedPosts.value = data
        }
        break
      case 'collections':
        ({ data, meta } = await userApi.getUserCollections(userInfo.value.id, params))
        if (isLoadMore) {
          collectedPosts.value.push(...data)
        } else {
          collectedPosts.value = data
        }
        break
    }
    
    total.value = meta.total
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// Load More
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  loadData(true)
}

// Handle Follow
const handleFollow = async () => {
  try {
    if (userInfo.value.isFollowing) {
      await userApi.unfollowUser(userInfo.value.id)
      userInfo.value.followers--
    } else {
      await userApi.followUser(userInfo.value.id)
      userInfo.value.followers++
    }
    userInfo.value.isFollowing = !userInfo.value.isFollowing
  } catch (error) {
    showError(error)
  }
}

// Handle Submit
const handleSubmit = async () => {
  try {
    submitting.value = true
    await userApi.updateProfile(form.value)
    await loadUserInfo()
    showMessage('Profile updated')
    showEditDialog.value = false
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// Watch Tab Change
watch(currentTab, () => {
  page.value = 1
  loadData()
})

// On Mounted
onMounted(() => {
  loadUserInfo()
  loadData()
})
</script>

<style scoped>
.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 