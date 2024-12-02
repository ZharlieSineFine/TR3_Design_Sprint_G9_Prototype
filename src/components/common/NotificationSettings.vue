<template>
  <v-dialog v-model="show" max-width="500">
    <v-card>
      <v-card-title>通知设置</v-card-title>
      <v-card-text>
        <v-list>
          <!-- 桌面通知设置 -->
          <v-list-item>
            <v-list-item-title>桌面通知</v-list-item-title>
            <template v-slot:append>
              <v-switch
                v-model="settings.desktop"
                hide-details
                @change="handleDesktopChange"
              />
            </template>
          </v-list-item>

          <!-- 声音设置 -->
          <v-list-item>
            <v-list-item-title>通知声音</v-list-item-title>
            <template v-slot:append>
              <v-switch
                v-model="settings.sound"
                hide-details
              />
            </template>
          </v-list-item>

          <!-- 通知类型设置 -->
          <v-list-subheader>接收以下类型的通知</v-list-subheader>
          <v-list-item v-for="type in notificationTypes" :key="type.value">
            <v-list-item-title>{{ type.label }}</v-list-item-title>
            <template v-slot:append>
              <v-checkbox
                v-model="settings.types"
                :value="type.value"
                hide-details
              />
            </template>
          </v-list-item>

          <!-- 轮询间隔设置 -->
          <v-list-item>
            <v-list-item-title>检查频率</v-list-item-title>
            <template v-slot:append>
              <v-select
                v-model="settings.interval"
                :items="intervalOptions"
                density="compact"
                hide-details
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="show = false">关闭</v-btn>
        <v-btn
          color="primary"
          @click="saveSettings"
        >
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from '@/utils/message'
import { notificationManager } from '@/utils/notification'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const { showMessage } = useMessage()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 通知类型选项
const notificationTypes = [
  { label: '点赞', value: 'like' },
  { label: '评论', value: 'comment' },
  { label: '关注', value: 'follow' },
  { label: '系统通知', value: 'system' }
]

// 轮询间隔选项
const intervalOptions = [
  { title: '30秒', value: 30000 },
  { title: '1分钟', value: 60000 },
  { title: '5分钟', value: 300000 }
]

// 设置状态
const settings = ref({
  desktop: false,
  sound: true,
  types: ['like', 'comment', 'follow', 'system'],
  interval: 30000
})

// 初始化设置
const initSettings = () => {
  const savedSettings = localStorage.getItem('notificationSettings')
  if (savedSettings) {
    Object.assign(settings.value, JSON.parse(savedSettings))
  }
}

// 处理桌面通知权限
const handleDesktopChange = async (value) => {
  if (value) {
    const granted = await notificationManager.requestNotificationPermission()
    settings.value.desktop = granted
    if (!granted) {
      showMessage('请允许桌面通知权限', 'warning')
    }
  }
}

// 保存设置
const saveSettings = () => {
  localStorage.setItem('notificationSettings', JSON.stringify(settings.value))
  notificationManager.updateSettings(settings.value)
  showMessage('设置已保存')
  show.value = false
}

// 初始化
initSettings()
</script> 