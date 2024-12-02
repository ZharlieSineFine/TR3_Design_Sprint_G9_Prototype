<template>
  <div class="voice-recorder">
    <v-btn
      :icon="isRecording ? 'mdi-stop' : 'mdi-microphone'"
      :color="isRecording ? 'error' : undefined"
      variant="text"
      @mousedown="startRecording"
      @mouseup="stopRecording"
      @mouseleave="cancelRecording"
    />
    
    <div
      v-if="isRecording"
      class="recording-indicator"
    >
      <div class="recording-wave" />
      <span class="recording-time">{{ formatTime(recordingTime) }}</span>
      <span class="recording-tip">Release to send, slide up to cancel</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useMessage } from '@/utils/message'

const props = defineProps({
  maxDuration: {
    type: Number,
    default: 60 // Maximum recording duration (seconds)
  }
})

const emit = defineEmits(['recorded'])
const { showMessage, showError } = useMessage()

const isRecording = ref(false)
const recordingTime = ref(0)
const mediaRecorder = ref(null)
const recordedChunks = ref([])
const timer = ref(null)

// Format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Start recording
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = () => {
      const blob = new Blob(recordedChunks.value, { type: 'audio/mp3' })
      emit('recorded', blob)
      recordedChunks.value = []
    }
    
    mediaRecorder.value.start()
    isRecording.value = true
    recordingTime.value = 0
    
    // Start timer
    timer.value = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= props.maxDuration) {
        stopRecording()
      }
    }, 1000)
  } catch (error) {
    showError('Cannot access microphone')
  }
}

// Stop recording
const stopRecording = () => {
  if (!isRecording.value) return
  
  clearInterval(timer.value)
  mediaRecorder.value?.stop()
  mediaRecorder.value?.stream.getTracks().forEach(track => track.stop())
  isRecording.value = false
}

// Cancel recording
const cancelRecording = () => {
  if (!isRecording.value) return
  
  clearInterval(timer.value)
  mediaRecorder.value?.stop()
  mediaRecorder.value?.stream.getTracks().forEach(track => track.stop())
  isRecording.value = false
  recordedChunks.value = []
  showMessage('Recording cancelled')
}

// Clean up
onUnmounted(() => {
  clearInterval(timer.value)
  if (mediaRecorder.value?.state === 'recording') {
    mediaRecorder.value.stop()
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
.voice-recorder {
  position: relative;
  display: inline-block;
}

.recording-indicator {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  white-space: nowrap;
}

.recording-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -8px;
  height: 2px;
  background: red;
  animation: wave 2s infinite;
}

.recording-time {
  margin-right: 8px;
}

.recording-tip {
  font-size: 12px;
  opacity: 0.8;
}

@keyframes wave {
  0% { transform: scaleX(0.1); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(0.1); }
}
</style> 