<template>
  <div class="chat-messages">
    <!-- 消息列表 -->
    <div
      ref="messageList"
      class="message-list"
      @scroll="handleScroll"
    >
      <!-- 加载更多 -->
      <div
        v-if="hasMore"
        class="text-center py-2"
      >
        <v-progress-circular
          v-if="loading"
          indeterminate
          size="20"
        />
        <v-btn
          v-else
          variant="text"
          size="small"
          @click="$emit('load-more')"
        >
          Load more
        </v-btn>
      </div>

      <!-- 消息内容 -->
      <template v-for="(message, index) in messages" :key="message.id">
        <!-- 日期分割线 -->
        <div
          v-if="showDateDivider(message, messages[index - 1])"
          class="date-divider"
        >
          {{ formatDate(message.createdAt) }}
        </div>

        <!-- 消息气泡 -->
        <div
          :class="[
            'message-item',
            { 'message-mine': message.fromId === userId }
          ]"
        >
          <v-avatar
            size="32"
            class="message-avatar"
          >
            <v-img :src="message.from.avatar" />
          </v-avatar>

          <div class="message-content">
            <!-- 文本消息 -->
            <template v-if="message.type === 'text'">
              <div class="message-bubble">
                {{ message.content }}
              </div>
            </template>

            <!-- 图片消息 -->
            <template v-else-if="message.type === 'image'">
              <v-img
                :src="message.content"
                max-width="200"
                class="message-image"
                @click="previewImage(message.content)"
              />
            </template>

            <!-- 文件消息 -->
            <template v-else-if="message.type === 'file'">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-file"
                :href="message.content"
                target="_blank"
              >
                Download file
              </v-btn>
            </template>

            <!-- 撤回消息 -->
            <template v-else-if="message.type === 'revoke'">
              <div class="message-revoke">
                Message recalled
              </div>
            </template>
          </div>

          <!-- 消息菜单 -->
          <v-menu
            v-model="message.showMenu"
            :position-x="message.menuX"
            :position-y="message.menuY"
            absolute
          >
            <v-list>
              <v-list-item
                v-for="item in getMessageMenuItems(message)"
                :key="item.action"
                @click="handleMessageAction(item.action, message)"
              >
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </div>

    <!-- 输入状态提示 -->
    <div v-if="showTypingIndicator" class="typing-indicator">
      {{ typingUser?.name }} is typing
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="message-input">
      <v-textarea
        v-model="inputContent"
        rows="3"
        auto-grow
        hide-details
        placeholder="Type a message..."
        @keydown.enter.prevent="handleSend"
        @input="handleInput"
      />

      <div class="input-actions">
        <v-btn
          icon="mdi-image"
          variant="text"
          @click="triggerImageUpload"
        />
        <v-btn
          icon="mdi-file"
          variant="text"
          @click="triggerFileUpload"
        />
        <voice-recorder @recorded="handleVoiceRecord" />
        <v-spacer />
        <v-btn
          color="primary"
          :loading="sending"
          @click="handleSend"
        >
          Send
        </v-btn>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        class="d-none"
        @change="handleImageSelect"
      >
      <input
        ref="fileInput"
        type="file"
        class="d-none"
        @change="handleFileSelect"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'
import { formatDate, formatTime } from '@/utils/date'
import { uploadApi } from '@/api'
import { debounce } from '@/utils/common'
import { ws } from '@/utils/websocket'
import VoiceRecorder from './VoiceRecorder.vue'

const props = defineProps({
  chatId: Number,
  messages: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  sending: Boolean,
  hasMore: Boolean,
  typingUsers: Map
})

const emit = defineEmits(['send', 'load-more', 'revoke'])
const userStore = useUserStore()
const { showMessage, showError } = useMessage()

// 状态
const messageList = ref(null)
const imageInput = ref(null)
const fileInput = ref(null)
const inputContent = ref('')
const userId = computed(() => userStore.user?.id)

// 监听消息变化，自动滚动到底部
watch(() => props.messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// 滚动到底部
const scrollToBottom = () => {
  const el = messageList.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

// 处理滚动
const handleScroll = (event) => {
  const { scrollTop, clientHeight, scrollHeight } = event.target
  // 滚动到顶部时加载更多
  if (scrollTop === 0 && !props.loading && props.hasMore) {
    emit('load-more')
  }
}

// 显示日期分割线
const showDateDivider = (current, previous) => {
  if (!previous) return true
  const currentDate = new Date(current.createdAt).toDateString()
  const previousDate = new Date(previous.createdAt).toDateString()
  return currentDate !== previousDate
}

// 获取消息菜单项
const getMessageMenuItems = (message) => {
  const items = []
  
  // 复制文本
  if (message.type === 'text') {
    items.push({
      title: 'Copy',
      action: 'copy'
    })
  }

  // 撤回消息（2分钟内）
  if (message.fromId === userId.value && message.type !== 'revoke') {
    const now = new Date()
    const messageTime = new Date(message.createdAt)
    const diffMinutes = (now - messageTime) / 1000 / 60
    if (diffMinutes <= 2) {
      items.push({
        title: 'Recall',
        action: 'revoke'
      })
    }
  }

  return items
}

// 处理消息操作
const handleMessageAction = (action, message) => {
  switch (action) {
    case 'copy':
      navigator.clipboard.writeText(message.content)
      showMessage('Copied')
      break
    case 'revoke':
      emit('revoke', message)
      break
  }
  message.showMenu = false
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value?.click()
}

// 处理图片选择
const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 检查文件类型和大小
  if (!file.type.startsWith('image/')) {
    showMessage('Please select an image file', 'warning')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage('Image size cannot exceed 5MB', 'warning')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const { url } = await uploadApi.uploadImage(formData)
    emit('send', {
      type: 'image',
      content: url
    })
  } catch (error) {
    showError(error)
  } finally {
    event.target.value = ''
  }
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 检查文件大小
  if (file.size > 10 * 1024 * 1024) {
    showMessage('文件大小不能超过10MB', 'warning')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const { url } = await uploadApi.uploadFile(formData)
    emit('send', {
      type: 'file',
      content: url
    })
  } catch (error) {
    showError(error)
  } finally {
    event.target.value = ''
  }
}

// 处理发送消息
const handleSend = () => {
  const content = inputContent.value.trim()
  if (!content) return

  emit('send', {
    type: 'text',
    content
  })
  inputContent.value = ''
}

// 防抖处理输入状态
const updateTypingStatus = debounce((typing) => {
  ws.send({
    type: 'typing',
    chatId: props.chatId,
    typing
  })
}, 300)

// 处理输入
const handleInput = () => {
  updateTypingStatus(true)
  // 停止输入3秒后发送停止输入状态
  setTimeout(() => {
    updateTypingStatus(false)
  }, 3000)
}

// 计算是否显示输入状态
const showTypingIndicator = computed(() => {
  const typingSet = props.typingUsers?.get(props.chatId)
  return typingSet && typingSet.size > 0
})

// 获取正在输入的用户
const typingUser = computed(() => {
  const typingSet = props.typingUsers?.get(props.chatId)
  if (!typingSet || typingSet.size === 0) return null
  
  const typingUserId = Array.from(typingSet)[0]
  return props.messages.find(msg => msg.from.id === typingUserId)?.from
})

// 处理语音消息
const handleVoiceRecord = async (blob) => {
  try {
    const formData = new FormData()
    formData.append('file', blob, 'voice.mp3')
    const { url } = await uploadApi.uploadVoice(formData)
    emit('send', {
      type: 'voice',
      content: url
    })
  } catch (error) {
    showError(error)
  }
}
</script>

<style scoped>
.chat-messages {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.date-divider {
  text-align: center;
  margin: 16px 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.message-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  position: relative;
}

.message-mine {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 8px;
}

.message-content {
  max-width: 70%;
  position: relative;
}

.message-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  background: white;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-mine .message-bubble {
  background: #0084ff;
  color: white;
}

.message-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  text-align: center;
}

.message-image {
  border-radius: 12px;
  cursor: pointer;
  max-width: 200px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

.message-revoke {
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
  text-align: center;
}

.message-input {
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding: 16px;
}

.input-actions {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

/* 添加打字动画 */
.typing-indicator {
  padding: 8px 16px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  display: flex;
  align-items: center;
}

.typing-dots {
  display: flex;
  margin-left: 8px;
}

.typing-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  margin: 0 2px;
  animation: typing 1s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}
</style> 