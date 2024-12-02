<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-toolbar-title>Profile</v-toolbar-title>
            <v-spacer />
            <v-btn
              v-if="!editing"
              icon="mdi-pencil"
              variant="text"
              @click="startEdit"
            />
          </v-toolbar>

          <v-card-text>
            <v-form v-if="editing" @submit.prevent="handleSubmit">
              <!-- 头像上传 -->
              <div class="d-flex justify-center mb-6">
                <v-avatar size="120" class="profile-avatar">
                  <v-img :src="form.avatar" />
                  <div class="avatar-overlay">
                    <v-btn
                      icon="mdi-camera"
                      size="small"
                      color="white"
                      @click="triggerAvatarUpload"
                    />
                    <input
                      ref="avatarInput"
                      type="file"
                      accept="image/*"
                      class="d-none"
                      @change="handleAvatarChange"
                    >
                  </div>
                </v-avatar>
              </div>

              <v-text-field
                v-model="form.name"
                label="Username"
                :rules="[v => !!v || 'Please enter a username']"
                required
              />

              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                :rules="[
                  v => !!v || 'Please enter an email',
                  v => /.+@.+\..+/.test(v) || 'Please enter a valid email address'
                ]"
                required
              />

              <v-textarea
                v-model="form.bio"
                label="Biography"
                auto-grow
                rows="3"
              />

              <v-card-actions>
                <v-spacer />
                <v-btn text @click="cancelEdit">Cancel</v-btn>
                <v-btn
                  color="primary"
                  :loading="submitting"
                  @click="handleSubmit"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-form>

            <!-- 查看模式 -->
            <template v-else>
              <div class="d-flex justify-center mb-6">
                <v-avatar size="120">
                  <v-img :src="userStore.user?.avatar" />
                </v-avatar>
              </div>

              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Username</v-list-item-title>
                  <v-list-item-subtitle>{{ userStore.user?.name }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ userStore.user?.email }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="userStore.user?.bio">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-card-text</v-icon>
                  </template>
                  <v-list-item-title>Biography</v-list-item-title>
                  <v-list-item-subtitle>{{ userStore.user?.bio }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>Last Login</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(userStore.user?.lastLoginAt) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </template>
          </v-card-text>
        </v-card>

        <!-- 修改密码卡片 -->
        <v-card class="mt-4">
          <v-card-title>Change Password</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handlePasswordChange">
              <v-text-field
                v-model="passwordForm.oldPassword"
                label="Current Password"
                type="password"
                :rules="[v => !!v || 'Please enter your current password']"
                required
              />

              <v-text-field
                v-model="passwordForm.newPassword"
                label="New Password"
                type="password"
                :rules="[
                  v => !!v || 'Please enter a new password',
                  v => v.length >= 6 || 'Password length must be at least 6 characters'
                ]"
                required
              />

              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password"
                type="password"
                :rules="[
                  v => !!v || 'Please confirm the new password',
                  v => v === passwordForm.newPassword || 'The two passwords entered do not match'
                ]"
                required
              />

              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="primary"
                  :loading="changingPassword"
                  @click="handlePasswordChange"
                >
                  Change Password
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'
import { formatDate } from '@/utils/date'
import { userApi } from '@/api'

const userStore = useUserStore()
const { showMessage, showError } = useMessage()
const avatarInput = ref(null)

// 编辑状态
const editing = ref(false)
const submitting = ref(false)
const changingPassword = ref(false)

// 表单数据
const form = ref({
  name: '',
  email: '',
  bio: '',
  avatar: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 开始编辑
const startEdit = () => {
  form.value = {
    name: userStore.user.name,
    email: userStore.user.email,
    bio: userStore.user.bio || '',
    avatar: userStore.user.avatar
  }
  editing.value = true
}

// 取消编辑
const cancelEdit = () => {
  editing.value = false
}

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像变更
const handleAvatarChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    const { url } = await userApi.uploadAvatar(formData)
    form.value.avatar = url
  } catch (error) {
    showError(error)
  } finally {
    event.target.value = ''
  }
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.name.trim()) {
    showMessage('Please enter a username', 'warning')
    return
  }

  if (!form.value.email.trim() || !/.+@.+\..+/.test(form.value.email)) {
    showMessage('Please enter a valid email address', 'warning')
    return
  }

  try {
    submitting.value = true
    await userApi.updateProfile(form.value)
    await userStore.initUser()
    showMessage('Profile saved successfully')
    editing.value = false
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// 修改密码
const handlePasswordChange = async () => {
  // 表单验证
  if (!passwordForm.value.oldPassword) {
    showMessage('Please enter your current password', 'warning')
    return
  }

  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
    showMessage('New password must be at least 6 characters', 'warning')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showMessage('The passwords entered do not match', 'warning')
    return
  }

  try {
    changingPassword.value = true
    await userApi.changePassword(passwordForm.value)
    showMessage('Password changed successfully')
    // Reset the form
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    showError(error)
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped>
.profile-avatar {
  position: relative;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}
</style> 