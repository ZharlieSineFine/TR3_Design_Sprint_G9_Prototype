<template>
  <div class="group-members">
    <v-toolbar density="compact">
      <v-toolbar-title>Members ({{ members.length }})</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="isAdmin"
        prepend-icon="mdi-account-plus"
        @click="showInviteDialog = true"
      >
        Invite Members
      </v-btn>
    </v-toolbar>

    <!-- 成员列表 -->
    <v-list>
      <template v-if="members.length">
        <v-list-item
          v-for="member in members"
          :key="member.id"
        >
          <template v-slot:prepend>
            <v-avatar size="40">
              <v-img :src="member.avatar" />
            </v-avatar>
          </template>

          <v-list-item-title>
            {{ member.name }}
            <v-chip
              v-if="member.role"
              size="x-small"
              :color="getRoleColor(member.role)"
              class="ml-2"
            >
              {{ getRoleLabel(member.role) }}
            </v-chip>
          </v-list-item-title>

          <v-list-item-subtitle>
            <span v-if="member.isMuted" class="text-error">
              Muted ({{ formatMuteTime(member.muteEndTime) }})
            </span>
            <span v-else>{{ member.joinTime ? formatDate(member.joinTime) : 'No join time' }}</span>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn
              v-if="canManage(member)"
              icon="mdi-dots-vertical"
              variant="text"
              size="small"
              @click.stop="showMemberMenu(member, $event)"
            />
          </template>
        </v-list-item>
      </template>
      <v-list-item v-else>
        <v-list-item-title class="text-center text-grey">
          No members
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- 邀请成员对话框 -->
    <v-dialog v-model="showInviteDialog" max-width="500">
      <v-card>
        <v-card-title>Invite Members</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="selectedUsers"
            :items="availableUsers"
            item-title="name"
            item-value="id"
            multiple
            chips
            label="Select users"
          >
            <template v-slot:selection="{ item }">
              <v-chip>{{ item.raw.name }}</v-chip>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-avatar size="32">
                    <v-img :src="item.raw.avatar" />
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showInviteDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="inviting"
            @click="inviteMembers"
          >
            Invite
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 成员操作菜单 -->
    <v-menu
      v-model="showMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
    >
      <v-list>
        <v-list-item @click="setRole(selectedMember)">
          <v-list-item-title>Set Role</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toggleMute(selectedMember)">
          <v-list-item-title>
            {{ selectedMember?.isMuted ? 'Unmute' : 'Mute' }}
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="isOwner"
          @click="transferOwnership(selectedMember)"
        >
          <v-list-item-title>Transfer Ownership</v-list-item-title>
        </v-list-item>
        <v-list-item
          color="error"
          @click="removeMember(selectedMember)"
        >
          <v-list-item-title>Remove Member</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- 禁言设置对话框 -->
    <v-dialog v-model="showMuteDialog" max-width="400">
      <v-card>
        <v-card-title>Set Mute Duration</v-card-title>
        <v-card-text>
          <v-select
            v-model="muteDuration"
            :items="muteDurations"
            label="Mute Duration"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showMuteDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            @click="handleMute"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

// 状态管理
const loading = ref(false)
const inviting = ref(false)
const submitting = ref(false)
const members = ref([])
const availableUsers = ref([])
const selectedUsers = ref([])
const showInviteDialog = ref(false)
const showMenu = ref(false)
const showMuteDialog = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const selectedMember = ref(null)
const muteDuration = ref(null)

// 禁言时长选项（分钟）
const muteDurations = [
  { title: '10 minutes', value: 10 },
  { title: '1 hour', value: 60 },
  { title: '12 hours', value: 720 },
  { title: '1 day', value: 1440 },
  { title: '7 days', value: 10080 },
  { title: '30 days', value: 43200 }
]

// 角色相关
const roles = {
  owner: { label: 'Owner', color: 'error' },
  admin: { label: 'Admin', color: 'warning' },
  member: { label: 'Member', color: 'default' }
}

// 计算属性
const isAdmin = computed(() => {
  const currentMember = members.value.find(m => m.id === userStore.user?.id)
  return currentMember?.role === 'admin' || currentMember?.role === 'owner'
})

const isOwner = computed(() => {
  const currentMember = members.value.find(m => m.id === userStore.user?.id)
  return currentMember?.role === 'owner'
})

// 获取角色标签
const getRoleLabel = (role) => roles[role]?.label || 'Member'

// 获取角色颜色
const getRoleColor = (role) => roles[role]?.color || 'default'

// 检查是否可以管理该成员
const canManage = (member) => {
  if (!isAdmin.value) return false
  if (member.id === userStore.user?.id) return false
  if (member.role === 'owner') return false
  if (member.role === 'admin' && !isOwner.value) return false
  return true
}

// 格式化禁言时间
const formatMuteTime = (endTime) => {
  const end = new Date(endTime)
  const now = new Date()
  const diff = end - now
  const minutes = Math.floor(diff / 1000 / 60)
  
  if (minutes < 60) return `${minutes} minutes`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`
  return `${Math.floor(minutes / 1440)} days`
}

// 加载成员列表
const loadMembers = async () => {
  try {
    loading.value = true
    const data = await chatApi.getGroupMembers(props.groupId)
    members.value = data
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}

// 加载可邀请的用户
const loadAvailableUsers = async () => {
  try {
    const users = await chatApi.getAvailableUsers()
    availableUsers.value = users.filter(user => 
      !members.value.some(member => member.id === user.id)
    )
  } catch (error) {
    showError(error)
  }
}

// 显示成员菜单
const showMemberMenu = (member, event) => {
  selectedMember.value = member
  menuX.value = event.clientX
  menuY.value = event.clientY
  showMenu.value = true
}

// 邀请成员
const inviteMembers = async () => {
  if (!selectedUsers.value.length) {
    showMessage('Please select users to invite', 'warning')
    return
  }

  try {
    inviting.value = true
    await chatApi.inviteGroupMembers(props.groupId, selectedUsers.value)
    const newMembers = availableUsers.value.filter(user => 
      selectedUsers.value.includes(user.id)
    )
    members.value.push(...newMembers)
    selectedUsers.value = []
    showMessage('Invitation sent')
  } catch (error) {
    showError(error)
  } finally {
    inviting.value = false
  }
}

// 移除成员
const removeMember = async (member) => {
  try {
    await chatApi.removeGroupMember(props.groupId, member.id)
    const index = members.value.findIndex(m => m.id === member.id)
    if (index > -1) {
      members.value.splice(index, 1)
    }
    showMessage('Member removed')
  } catch (error) {
    showError(error)
  }
  showMenu.value = false
}

// 切换禁言状态
const toggleMute = (member) => {
  if (member.isMuted) {
    unmuteUser(member)
  } else {
    showMuteDialog.value = true
  }
  showMenu.value = false
}

// 禁言用户
const handleMute = async () => {
  if (!muteDuration.value) {
    showMessage('Please select mute duration', 'warning')
    return
  }

  try {
    submitting.value = true
    await chatApi.muteGroupMember(props.groupId, selectedMember.value.id, muteDuration.value)
    selectedMember.value.isMuted = true
    selectedMember.value.muteEndTime = new Date(Date.now() + muteDuration.value * 60 * 1000)
    showMessage('Member muted')
    showMuteDialog.value = false
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// 解除禁言
const unmuteUser = async (member) => {
  try {
    await chatApi.unmuteGroupMember(props.groupId, member.id)
    member.isMuted = false
    member.muteEndTime = null
    showMessage('Member unmuted')
  } catch (error) {
    showError(error)
  }
}

// 转让群主
const transferOwnership = async (member) => {
  try {
    await chatApi.transferGroupOwnership(props.groupId, member.id)
    // 更新角色
    const oldOwner = members.value.find(m => m.role === 'owner')
    if (oldOwner) oldOwner.role = 'admin'
    member.role = 'owner'
    showMessage('Ownership transferred')
  } catch (error) {
    showError(error)
  }
  showMenu.value = false
}

// 初始化
onMounted(() => {
  loadMembers()
})

// 监听邀请对话框
watch(showInviteDialog, (value) => {
  if (value) {
    loadAvailableUsers()
  }
})
</script>

<style scoped>
.group-members {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.v-list {
  flex: 1;
  overflow-y: auto;
}
</style> 