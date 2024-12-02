<template>
  <div class="group-files">
    <v-toolbar density="compact">
      <v-toolbar-title>Group Files</v-toolbar-title>
      <v-spacer />
      <v-btn
        prepend-icon="mdi-upload"
        @click="$refs.fileInput.click()"
      >
        Upload File
      </v-btn>
    </v-toolbar>

    <!-- 文件列表 -->
    <v-list>
      <template v-if="files.length">
        <v-list-item
          v-for="file in files"
          :key="file.id"
        >
          <!-- 文件图标 -->
          <template v-slot:prepend>
            <v-icon :icon="getFileIcon(file.type)" size="32" />
          </template>

          <!-- 文件信息 -->
          <v-list-item-title>{{ file.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <span>{{ formatFileSize(file.size) }}</span>
            <span class="mx-2">·</span>
            <span>{{ formatDate(file.createdAt) }}</span>
            <span class="mx-2">·</span>
            <span>{{ file.uploader.name }}</span>
          </v-list-item-subtitle>

          <!-- 操作按钮 -->
          <template v-slot:append>
            <v-btn
              icon="mdi-download"
              variant="text"
              size="small"
              @click="downloadFile(file)"
            />
            <v-btn
              v-if="canDelete(file)"
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteFile(file)"
            />
          </template>
        </v-list-item>
      </template>
      <v-list-item v-else>
        <v-list-item-title class="text-center text-grey">
          No files
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="text-center py-4">
      <v-btn
        variant="text"
        :loading="loading"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      class="d-none"
      @change="handleFileUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import { chatApi } from '@/api'

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  }
})

const userStore = useUserStore()
const { showMessage, showError } = useMessage()

const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const files = ref([])
const fileInput = ref(null)

const hasMore = computed(() => files.value.length < total.value)

// 获取文件图标
const getFileIcon = (type) => {
  switch (type) {
    case 'image': return 'mdi-image'
    case 'video': return 'mdi-video'
    case 'audio': return 'mdi-music'
    case 'document': return 'mdi-file-document'
    case 'archive': return 'mdi-zip-box'
    default: return 'mdi-file'
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 检查是否可以删除文件
const canDelete = (file) => {
  return file.uploader.id === userStore.user?.id || userStore.user?.isAdmin
}

// 加载文件列表
const loadFiles = async (isLoadMore = false) => {
  if (loading.value) return

  try {
    loading.value = true
    const { data, meta } = await chatApi.getGroupFiles(props.groupId, {
      page: page.value,
      pageSize: pageSize.value
    })
    
    if (isLoadMore) {
      files.value.push(...data)
    } else {
      files.value = data
    }
    total.value = meta.total
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loading.value || !hasMore.value) return
  page.value++
  loadFiles(true)
}

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    loading.value = true
    await chatApi.uploadGroupFile(props.groupId, file)
    showMessage('Upload successful')
    // 重新加载文件列表
    page.value = 1
    await loadFiles()
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
    event.target.value = ''
  }
}

// 下载文件
const downloadFile = (file) => {
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 删除文件
const deleteFile = async (file) => {
  try {
    await chatApi.deleteGroupFile(props.groupId, file.id)
    const index = files.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      files.value.splice(index, 1)
    }
    showMessage('File deleted')
  } catch (error) {
    showError(error)
  }
}

// 初始化
onMounted(() => {
  loadFiles()
})
</script>

<style scoped>
.group-files {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-list {
  flex: 1;
  overflow-y: auto;
}
</style> 