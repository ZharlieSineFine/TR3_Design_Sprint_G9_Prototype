<template>
  <v-container>
    <v-row>
      <!-- Product Information -->
      <v-col cols="12" md="8">
        <v-card>
          <!-- Product Image Carousel -->
          <v-carousel
            v-if="item.images?.length"
            hide-delimiters
            show-arrows="hover"
            height="400"
          >
            <v-carousel-item
              v-for="(image, i) in item.images"
              :key="i"
              :src="image"
              cover
            />
          </v-carousel>

          <v-card-title class="text-h5">{{ item.title }}</v-card-title>
          
          <v-card-subtitle>
            <div class="d-flex align-center">
              <v-chip
                color="error"
                size="large"
                class="mr-2"
              >
                ¥{{ item.price }}
              </v-chip>
              <span class="text-grey text-decoration-line-through">
                ¥{{ item.originalPrice }}
              </span>
              <v-chip
                v-if="item.status === 'sold'"
                color="grey"
                class="ml-4"
              >
                Sold Out
              </v-chip>
            </div>
          </v-card-subtitle>

          <v-card-text>
            <div class="text-body-1 mb-4">
              {{ item.description }}
            </div>

            <v-chip-group>
              <v-chip
                v-if="item.category"
                color="primary"
                variant="outlined"
              >
                {{ getCategoryLabel(item.category) }}
              </v-chip>
              <v-chip variant="outlined">
                Views {{ item.views }}
              </v-chip>
              <v-chip variant="outlined">
                Collects {{ item.collects }}
              </v-chip>
            </v-chip-group>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-btn
              prepend-icon="mdi-heart"
              :color="item.isLiked ? 'error' : undefined"
              variant="text"
              @click="handleLike"
            >
              {{ item.likes || 0 }}
            </v-btn>
            <v-btn
              prepend-icon="mdi-bookmark"
              :color="item.isCollected ? 'primary' : undefined"
              variant="text"
              @click="handleCollect"
            >
              Collect
            </v-btn>
            <v-btn
              prepend-icon="mdi-share"
              variant="text"
              @click="handleShare"
            >
              Share
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="isOwner && item.status === 'on_sale'"
              color="error"
              variant="text"
              @click="handleMarkAsSold"
            >
              Mark as Sold
            </v-btn>
            <v-btn
              v-if="!isOwner && item.status === 'on_sale'"
              color="primary"
              @click="handleContact"
            >
              Contact Seller
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Comments Section -->
        <v-card class="mt-4">
          <v-card-title>Comments ({{ comments.length }})</v-card-title>
          
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

          <v-list>
            <v-list-item
              v-for="comment in comments"
              :key="comment.id"
            >
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
              
              <v-list-item-subtitle class="mt-2">
                {{ comment.content }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Seller Information -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Seller Information</v-card-title>
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-avatar size="64" class="mr-4">
                <v-img :src="item.seller?.avatar" />
              </v-avatar>
              <div>
                <div class="text-h6">{{ item.seller?.name }}</div>
                <div class="text-caption">
                  Posted on {{ formatDate(item.createdAt) }}
                </div>
              </div>
            </div>

            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-store</v-icon>
                </template>
                <v-list-item-title>On Sale</v-list-item-title>
                <template v-slot:append>
                  {{ item.seller?.onSaleCount || 0 }}
                </template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Sold Items</v-list-item-title>
                <template v-slot:append>
                  {{ item.seller?.soldCount || 0 }}
                </template>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-star</v-icon>
                </template>
                <v-list-item-title>Positive Rating</v-list-item-title>
                <template v-slot:append>
                  {{ item.seller?.rating || 0 }}%
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn
              block
              color="primary"
              @click="handleContact"
            >
              Contact Seller
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Related Products -->
        <v-card class="mt-4">
          <v-card-title>Related Products</v-card-title>
          <v-list>
            <v-list-item
              v-for="item in relatedItems"
              :key="item.id"
              :to="`/marketplace/${item.id}`"
            >
              <template v-slot:prepend>
                <v-avatar rounded size="48">
                  <v-img :src="item.images[0]" cover />
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  color="error"
                  size="x-small"
                  class="mr-2"
                >
                  ¥{{ item.price }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Share Dialog -->
    <share-dialog
      v-model="showShareDialog"
      :url="shareUrl"
      :title="item.title"
      @shared="handleShared"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from '@/utils/message'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'
import { marketplaceApi } from '@/api'
import ShareDialog from '@/components/common/ShareDialog.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { showMessage, showError } = useMessage()

const loading = ref(false)
const submitting = ref(false)
const showShareDialog = ref(false)
const shareUrl = ref('')
const newComment = ref('')
const comments = ref([])
const relatedItems = ref([])

// Product Information
const item = ref({
  id: '',
  title: '',
  price: 0,
  originalPrice: 0,
  description: '',
  category: '',
  images: [],
  status: 'on_sale',
  views: 0,
  likes: 0,
  collects: 0,
  isLiked: false,
  isCollected: false,
  createdAt: new Date(),
  seller: null
})

// Check if the user is the seller
const isOwner = computed(() => 
  item.value.seller?.id === userStore.user?.id
)

// Get category label
const getCategoryLabel = (value) => {
  const category = categories.find(c => c.value === value)
  return category ? category.title : value
}

// Load product details
const loadItemDetail = async () => {
  try {
    loading.value = true
    const data = await marketplaceApi.getItemDetail(route.params.id)
    Object.assign(item.value, data)
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// Load comments
const loadComments = async () => {
  try {
    const data = await marketplaceApi.getItemComments(route.params.id)
    comments.value = data
  } catch (error) {
    showError(error)
  }
}

// Load related products
const loadRelatedItems = async () => {
  try {
    const data = await marketplaceApi.getRelatedItems(route.params.id)
    relatedItems.value = data
  } catch (error) {
    showError(error)
  }
}

// Handle like
const handleLike = async () => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    await marketplaceApi.likeItem(item.value.id)
    item.value.isLiked = !item.value.isLiked
    item.value.likes += item.value.isLiked ? 1 : -1
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
    await marketplaceApi.collectItem(item.value.id)
    item.value.isCollected = !item.value.isCollected
    item.value.collects += item.value.isCollected ? 1 : -1
  } catch (error) {
    showError(error)
  }
}

// Handle share
const handleShare = () => {
  shareUrl.value = window.location.href
  showShareDialog.value = true
}

// Handle shared
const handleShared = (platform) => {
  showMessage(`Shared to ${platform}`)
}

// Handle comment
const handleComment = async () => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }

  try {
    submitting.value = true
    await marketplaceApi.commentItem(item.value.id, {
      content: newComment.value
    })
    await loadComments()
    newComment.value = ''
    showMessage('Comment posted successfully')
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// Mark as sold
const handleMarkAsSold = async () => {
  try {
    await marketplaceApi.markItemAsSold(item.value.id)
    item.value.status = 'sold'
    showMessage('Marked as sold')
  } catch (error) {
    showError(error)
  }
}

// Contact seller
const handleContact = () => {
  if (!userStore.user) {
    showMessage('Please login first', 'warning')
    return
  }
  // Redirect to chat page
  router.push(`/chat/${item.value.seller.id}`)
}

// Initialize
onMounted(() => {
  loadItemDetail()
  loadComments()
  loadRelatedItems()
})
</script> 