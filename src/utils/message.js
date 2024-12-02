import { getCurrentInstance } from 'vue'
import mitt from 'mitt'

const emitter = mitt()

export const useMessage = () => {
  const instance = getCurrentInstance()
  const message = instance?.proxy?.$message

  if (message) {
    return message.useMessage()
  }

  // If message is not found in the component instance, use event to send
  return {
    showMessage: (msg, type = 'success', timeout = 3000) => {
      emitter.emit('show-message', { message: msg, type, timeout })
    },
    showSuccess: (msg) => {
      emitter.emit('show-message', { message: msg, type: 'success' })
    },
    showError: (msg) => {
      if (msg?.response?.data?.message) {
        msg = msg.response.data.message
      } else if (typeof msg === 'object') {
        msg = 'Operation failed'
      }
      emitter.emit('show-message', { message: msg, type: 'error' })
    },
    showWarning: (msg) => {
      emitter.emit('show-message', { message: msg, type: 'warning' })
    },
    showInfo: (msg) => {
      emitter.emit('show-message', { message: msg, type: 'info' })
    }
  }
} 