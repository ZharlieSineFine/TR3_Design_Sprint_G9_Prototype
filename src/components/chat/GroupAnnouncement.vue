<template>
  <div class="group-announcement">
    <v-toolbar density="compact">
      <v-toolbar-title>Announcements</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="isAdmin"
        prepend-icon="mdi-plus"
        @click="showCreateDialog = true"
      >
        Post Announcement
      </v-btn>
    </v-toolbar>

    <!-- 公告列表 -->
    <v-list>
      <template v-if="announcements.length">
        <v-list-item
          v-for="announcement in announcements"
          :key="announcement.id"
          :active="announcement.pinned"
        >
          <!-- 公告内容 -->
          <v-list-item-title class="font-weight-bold">
            {{ announcement.title }}
            <v-chip
              v-if="announcement.pinned"
              size="x-small"
              color="primary"
              class="ml-2"
            >
              Pinned
            </v-chip>
          </v-list-item-title>
          
          <v-list-item-subtitle class="mt-2 text-body-1">
            {{ announcement.content }}
          </v-list-item-subtitle>

          <!-- 公告信息 -->
          <v-list-item-subtitle class="mt-2 d-flex align-center">
            <v-avatar size="24" class="mr-2">
              <v-img :src="announcement.author.avatar" />
            </v-avatar>
            <span>{{ announcement.author.name }}</span>
            <span class="mx-2">·</span>
            <span>{{ formatDate(announcement.createdAt) }}</span>
            <v-spacer />
            <v-btn
              v-if="canManage(announcement)"
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              @click.stop="openMenu(announcement, $event)"
            />
          </v-list-item-subtitle>
        </v-list-item>
      </template>
      <v-list-item v-else>
        <v-list-item-title class="text-center text-grey">
          No announcements
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

    <!-- 发布公告对话框 -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingAnnouncement ? 'Edit Announcement' : 'Post Announcement' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="form.title"
              label="Title"
              :rules="[v => !!v || 'Please enter title']"
              required
            />
            
            <v-textarea
              v-model="form.content"
              label="Content"
              :rules="[v => !!v || 'Please enter content']"
              rows="5"
              counter
              maxlength="500"
              required
            />

            <v-switch
              v-model="form.pinned"
              label="Pin Announcement"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ editingAnnouncement ? 'Save' : 'Post' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 操作菜单 -->
    <v-menu
      v-model="showMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
    >
      <v-list>
        <v-list-item @click="editAnnouncement(selectedAnnouncement)">
          <v-list-item-title>Edit</v-list-item-title>
        </v-list-item>
        <v-list-item @click="togglePin(selectedAnnouncement)">
          <v-list-item-title>
            {{ selectedAnnouncement?.pinned ? 'Unpin' : 'Pin' }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item @click="deleteAnnouncement(selectedAnnouncement)">
          <v-list-item-title class="text-error">Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
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
const submitting = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const announcements = ref([])
const showCreateDialog = ref(false)
const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const selectedAnnouncement = ref(null)
const editingAnnouncement = ref(null)

// 表单数据
const form = ref({
  title: '',
  content: '',
  pinned: false
})

const hasMore = computed(() => announcements.value.length < total.value)
const isAdmin = computed(() => userStore.user?.isAdmin)

// 检查是否可以管理公告
const canManage = (announcement) => {
  return announcement.author.id === userStore.user?.id || isAdmin.value
}

// 加载公告列表
const loadAnnouncements = async (isLoadMore = false) => {
  if (loading.value) return

  try {
    loading.value = true
    const { data, meta } = await chatApi.getGroupAnnouncements(props.groupId, {
      page: page.value,
      pageSize: pageSize.value
    })
    
    if (isLoadMore) {
      announcements.value.push(...data)
    } else {
      announcements.value = data
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
  loadAnnouncements(true)
}

// 显示菜单
const openMenu = (announcement, event) => {
  selectedAnnouncement.value = announcement
  menuX.value = event.clientX
  menuY.value = event.clientY
  showMenu.value = true
}

// 编辑公告
const editAnnouncement = (announcement) => {
  editingAnnouncement.value = announcement
  Object.assign(form.value, {
    title: announcement.title,
    content: announcement.content,
    pinned: announcement.pinned
  })
  showCreateDialog.value = true
  showMenu.value = false
}

// 切换置顶状态
const togglePin = async (announcement) => {
  try {
    await chatApi.updateGroupAnnouncement(props.groupId, announcement.id, {
      pinned: !announcement.pinned
    })
    announcement.pinned = !announcement.pinned
    showMessage(announcement.pinned ? 'Pinned' : 'Unpinned')
  } catch (error) {
    showError(error)
  }
  showMenu.value = false
}

// 删除公告
const deleteAnnouncement = async (announcement) => {
  try {
    await chatApi.deleteGroupAnnouncement(props.groupId, announcement.id)
    const index = announcements.value.findIndex(a => a.id === announcement.id)
    if (index > -1) {
      announcements.value.splice(index, 1)
    }
    showMessage('Deleted successfully')
  } catch (error) {
    showError(error)
  }
  showMenu.value = false
}

// 提交公告
const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    showMessage('Please fill in all information', 'warning')
    return
  }

  try {
    submitting.value = true
    if (editingAnnouncement.value) {
      await chatApi.updateGroupAnnouncement(
        props.groupId,
        editingAnnouncement.value.id,
        form.value
      )
      showMessage('Updated successfully')
    } else {
      await chatApi.createGroupAnnouncement(props.groupId, form.value)
      showMessage('Posted successfully')
    }
    
    // 重置表单
    form.value = {
      title: '',
      content: '',
      pinned: false
    }
    editingAnnouncement.value = null
    showCreateDialog.value = false
    
    // 重新加载列表
    page.value = 1
    await loadAnnouncements()
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.group-announcement {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-list {
  flex: 1;
  overflow-y: auto;
}
</style> 