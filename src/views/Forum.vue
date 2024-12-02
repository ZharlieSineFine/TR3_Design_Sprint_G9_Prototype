<template>
  <v-container>
    <v-row>
      <!-- 帖子列表 -->
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-toolbar flat>
            <v-toolbar-title>Knowledge Forum</v-toolbar-title>
            <v-spacer />
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showNewPostDialog = true"
            >
              Post
            </v-btn>
          </v-toolbar>
        </v-card>

        <!-- 加载状态 -->
        <v-progress-linear
          v-if="loading"
          indeterminate
          color="primary"
        />

        <!-- 帖子列表 -->
        <post-list 
          :posts="posts" 
          :loading="loading"
          @refresh="loadPosts"
        />
      </v-col>

      <!-- 分类导航 -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Category Navigation</v-card-title>
          <v-list>
            <v-list-item
              v-for="category in categories"
              :key="category.id"
              :value="category"
              :title="category.name"
              :subtitle="`${category.count} topics`"
              @click="selectCategory(category)"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- 发帖对话框 -->
    <post-edit-dialog
      v-model="showNewPostDialog"
      @saved="handlePostSaved"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessage } from '@/utils/message'
import { postApi } from '@/api'
import PostList from '@/components/forum/PostList.vue'
import PostEditDialog from '@/components/forum/PostEditDialog.vue'

const { showError } = useMessage()

// 状态
const posts = ref([])
const loading = ref(false)
const showNewPostDialog = ref(false)

// 分类数据
const categories = ref([
  { id: 'study', name: 'Study', count: 42 },
  { id: 'life', name: 'Life', count: 28 },
  { id: 'activity', name: 'Activity', count: 15 }
])

// 加载帖子列表
const loadPosts = async () => {
  try {
    loading.value = true
    const { data } = await postApi.getPosts()
    posts.value = data
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 选择分类
const selectCategory = (category) => {
  // 实现分类筛选逻辑
}

// 处理帖子保存
const handlePostSaved = () => {
  loadPosts()
}

// 初始化
onMounted(() => {
  loadPosts()
})
</script>

<style>
/* 确保对话框内的编辑器不会超出范围 */
.v-dialog .ql-editor {
  max-height: 400px;
  overflow-y: auto;
}
</style> 