<template>
  <v-snackbar
    v-model="show"
    :color="type"
    :timeout="timeout"
    location="top"
  >
    {{ message }}

    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="show = false"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import mitt from 'mitt'

const emitter = mitt()

// 状态
const show = ref(false)
const message = ref('')
const type = ref('success')
const timeout = ref(3000)

// 显示消息
const showMessage = (msg, msgType = 'success', duration = 3000) => {
  message.value = msg
  type.value = msgType
  timeout.value = duration
  show.value = true
}

// 导出消息方法
const useMessage = () => {
  return {
    showMessage: (msg, type = 'success') => showMessage(msg, type),
    showSuccess: (msg) => showMessage(msg, 'success'),
    showError: (msg) => showMessage(msg, 'error'),
    showWarning: (msg) => showMessage(msg, 'warning'),
    showInfo: (msg) => showMessage(msg, 'info')
  }
}

// 监听消息事件
emitter.on('show-message', ({ message, type, timeout }) => {
  showMessage(message, type, timeout)
})

defineExpose({
  showMessage,
  useMessage
})
</script> 