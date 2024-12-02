<template>
  <v-dialog
    v-model="show"
    max-width="800px"
    scrollable
  >
    <v-card>
      <!-- 商品图片轮播 -->
      <v-carousel
        v-if="item?.images?.length"
        hide-delimiters
        height="400"
      >
        <v-carousel-item
          v-for="(image, i) in item.images"
          :key="i"
          :src="image.url"
          cover
        />
      </v-carousel>
      <v-img
        v-else
        src="/placeholder.png"
        height="400"
        cover
      />

      <v-card-text>
        <!-- 商品标题和价格 -->
        <div class="d-flex align-center mb-4">
          <h2 class="text-h5">{{ item?.title }}</h2>
          <v-spacer />
          <div class="text-h5 text-primary">￥{{ item?.price }}</div>
        </div>

        <!-- 商品信息 -->
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-tag</v-icon>
            </template>
            <v-list-item-title>Category</v-list-item-title>
            <v-list-item-subtitle>
              {{ getCategoryLabel(item?.category) }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-star</v-icon>
            </template>
            <v-list-item-title>Condition</v-list-item-title>
            <v-list-item-subtitle>
              {{ getConditionLabel(item?.condition) }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Seller</v-list-item-title>
            <v-list-item-subtitle class="d-flex align-center">
              <v-avatar size="24" class="mr-2">
                <v-img :src="item?.seller?.avatar" />
              </v-avatar>
              {{ item?.seller?.name }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-clock</v-icon>
            </template>
            <v-list-item-title>Posted Time</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(item?.createdAt) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <!-- 商品描述 -->
        <div class="mt-4">
          <div class="text-h6 mb-2">Item Description</div>
          <div class="description" v-html="item?.description" />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="show = false">Close</v-btn>
        <template v-if="item?.status === 'available'">
          <v-btn
            v-if="isOwner"
            color="primary"
            @click="handleEdit"
          >
            Edit
          </v-btn>
          <v-btn
            v-else
            color="primary"
            prepend-icon="mdi-message"
            @click="handleContact"
          >
            Contact Seller
          </v-btn>
        </template>
        <v-btn
          v-else
          disabled
        >
          Sold Out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'edit'])
const router = useRouter()
const userStore = useUserStore()

// 计算属性
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isOwner = computed(() => {
  return props.item?.seller?.id === userStore.user?.id
})

// 获取分类标签
const getCategoryLabel = (value) => {
  const categories = {
    digital: '数码产品',
    books: '图书教材',
    life: '生活用品',
    clothing: '服装鞋帽',
    other: '其他'
  }
  return categories[value] || value
}

// 获取成色标签
const getConditionLabel = (value) => {
  const conditions = {
    new: '全新',
    '90': '9成新',
    '80': '8成新',
    '70': '7成新',
    '60': '6成新及以下'
  }
  return conditions[value] || value
}

// 处理编辑
const handleEdit = () => {
  emit('edit')
}

// 处理联系卖家
const handleContact = () => {
  if (!userStore.user) {
    router.push('/login')
    return
  }
  // 跳转到聊天页面
  router.push(`/chat?targetId=${props.item.seller.id}`)
  show.value = false
}
</script>

<style scoped>
.description {
  white-space: pre-wrap;
}

.description :deep(img) {
  max-width: 100%;
  height: auto;
}
</style> 