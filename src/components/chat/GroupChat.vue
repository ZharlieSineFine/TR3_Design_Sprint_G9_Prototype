<template>
  <div class="group-chat">
    <!-- 群聊信息头部 -->
    <v-toolbar density="compact">
      <v-toolbar-title>
        {{ group.name }}
        <span class="text-caption">({{ group.members.length }} members)</span>
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon="mdi-cog"
        @click="showSettings = true"
      />
    </v-toolbar>

    <!-- 群聊设置对话框 -->
    <v-dialog v-model="showSettings" max-width="500">
      <v-card>
        <v-card-title>Group Settings</v-card-title>
        <v-card-text>
          <!-- 群名称设置 -->
          <v-text-field
            v-if="isOwner"
            v-model="groupName"
            label="Group Name"
            :rules="[v => !!v || 'Please enter group name']"
          />

          <!-- 群成员列表 -->
          <v-list>
            <v-list-subheader>Members ({{ group.members.length }})</v-list-subheader>
            <v-list-item
              v-for="member in group.members"
              :key="member.id"
            >
              <template v-slot:prepend>
                <v-avatar size="32">
                  <v-img :src="member.avatar" />
                </v-avatar>
              </template>
              
              <v-list-item-title>
                {{ member.name }}
                <v-chip
                  v-if="member.id === group.ownerId"
                  size="x-small"
                  color="primary"
                  class="ml-2"
                >
                  Owner
                </v-chip>
              </v-list-item-title>

              <template v-slot:append>
                <v-btn
                  v-if="isOwner && member.id !== group.ownerId"
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="removeMember(member)"
                />
              </template>
            </v-list-item>
          </v-list>

          <!-- 邀请成员 -->
          <v-expansion-panels v-if="isOwner">
            <v-expansion-panel>
              <v-expansion-panel-title>Invite Members</v-expansion-panel-title>
              <v-expansion-panel-text>
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
                <v-btn
                  color="primary"
                  block
                  class="mt-2"
                  :loading="inviting"
                  @click="inviteMembers"
                >
                  Invite
                </v-btn>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- 退出群聊 -->
          <v-btn
            v-if="!isOwner"
            color="error"
            block
            class="mt-4"
            @click="leaveGroup"
          >
            Leave Group
          </v-btn>

          <!-- 解散群聊 -->
          <v-btn
            v-else
            color="error"
            block
            class="mt-4"
            @click="dismissGroup"
          >
            Dismiss Group
          </v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showSettings = false">Close</v-btn>
          <v-btn
            v-if="isOwner"
            color="primary"
            :loading="saving"
            @click="saveSettings"
          >
            Save
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
import { chatApi } from '@/api'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:group', 'leave', 'dismiss'])
const userStore = useUserStore()
const { showMessage, showError } = useMessage()

const showSettings = ref(false)
const saving = ref(false)
const inviting = ref(false)
const groupName = ref(props.group.name)
const selectedUsers = ref([])

// 是否是群主
const isOwner = computed(() => 
  props.group.ownerId === userStore.user?.id
)

// 可邀请的用户列表
const availableUsers = ref([])

// 加载可邀请的用户
const loadAvailableUsers = async () => {
  try {
    const users = await chatApi.getAvailableUsers()
    availableUsers.value = users.filter(user => 
      !props.group.members.some(member => member.id === user.id)
    )
  } catch (error) {
    showError(error)
  }
}

// 保存设置
const saveSettings = async () => {
  if (!groupName.value.trim()) {
    showMessage('Please enter group name', 'warning')
    return
  }

  try {
    saving.value = true
    const updatedGroup = await chatApi.updateGroup(props.group.id, {
      name: groupName.value
    })
    emit('update:group', updatedGroup)
    showMessage('Settings saved')
    showSettings.value = false
  } catch (error) {
    showError(error)
  } finally {
    saving.value = false
  }
}

// 移除成员
const removeMember = async (member) => {
  try {
    await chatApi.removeGroupMember(props.group.id, member.id)
    const index = props.group.members.findIndex(m => m.id === member.id)
    if (index > -1) {
      props.group.members.splice(index, 1)
    }
    showMessage('Member removed')
  } catch (error) {
    showError(error)
  }
}

// 邀请成员
const inviteMembers = async () => {
  if (!selectedUsers.value.length) {
    showMessage('Please select users to invite', 'warning')
    return
  }

  try {
    inviting.value = true
    await chatApi.inviteGroupMembers(props.group.id, selectedUsers.value)
    const newMembers = availableUsers.value.filter(user => 
      selectedUsers.value.includes(user.id)
    )
    props.group.members.push(...newMembers)
    selectedUsers.value = []
    showMessage('Invitation sent')
  } catch (error) {
    showError(error)
  } finally {
    inviting.value = false
  }
}

// 退出群聊
const leaveGroup = async () => {
  try {
    await chatApi.leaveGroup(props.group.id)
    emit('leave')
    showMessage('Left the group')
  } catch (error) {
    showError(error)
  }
}

// 解散群聊
const dismissGroup = async () => {
  try {
    await chatApi.dismissGroup(props.group.id)
    emit('dismiss')
    showMessage('Group dismissed')
  } catch (error) {
    showError(error)
  }
}

// 初始化
onMounted(() => {
  if (isOwner.value) {
    loadAvailableUsers()
  }
})
</script> 