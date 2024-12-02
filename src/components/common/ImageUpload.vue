<template>
  <div class="image-upload">
    <!-- Image List -->
    <v-row>
      <v-col
        v-for="(image, index) in displayImages"
        :key="index"
        cols="4"
        sm="3"
        md="2"
      >
        <v-card class="image-item">
          <v-img
            :src="getImageUrl(image)"
            aspect-ratio="1"
            cover
          />
          <div class="image-actions">
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="removeImage(index)"
            />
          </div>
        </v-card>
      </v-col>

      <!-- Upload Button -->
      <v-col
        v-if="displayImages.length < maxCount"
        cols="4"
        sm="3"
        md="2"
      >
        <v-card
          class="image-upload-btn d-flex align-center justify-center"
          height="100%"
          @click="triggerUpload"
          :loading="uploading"
        >
          <v-icon size="32">mdi-plus</v-icon>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="d-none"
            @change="handleFileChange"
          >
        </v-card>
      </v-col>
    </v-row>

    <!-- Prompt Information -->
    <div class="text-caption text-grey mt-2">
      Support jpg, png, gif formats, single image not exceeding 5MB, maximum upload {{ maxCount }} pieces
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from '@/utils/message'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  initialImages: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 9
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

const emit = defineEmits(['update:images'])
const { showMessage, showError } = useMessage()

// State
const fileInput = ref(null)
const uploading = ref(false)

// Computed Property: Handle Different Formats of Image Data
const displayImages = computed(() => {
  return props.images.map(image => {
    // If it is a string (URL), convert it to object format
    if (typeof image === 'string') {
      return { url: image }
    }
    // If it is already in object format, return directly
    return image
  })
})

// Helper Function to Get Image URL
const getImageUrl = (image) => {
  return typeof image === 'string' ? image : image.url
}

// Trigger File Selection
const triggerUpload = () => {
  fileInput.value?.click()
}

// Handle File Selection
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  // Check the number of files
  if (files.length + props.images.length > props.maxCount) {
    showMessage(`You can only upload ${props.maxCount} images at most`, 'warning')
    return
  }

  // Check file type and size
  const invalidFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      showMessage(`${file.name} is not a valid image file`, 'warning')
      return true
    }
    if (file.size > props.maxSize) {
      showMessage(`${file.name} exceeds the size limit`, 'warning')
      return true
    }
    return false
  })

  if (invalidFiles.length) return

  try {
    uploading.value = true
    const uploadedImages = await Promise.all(
      files.map(async file => {
        const formData = new FormData()
        formData.append('file', file)
        const { url } = await uploadApi.uploadImage(formData)
        return url  // Directly return URL string
      })
    )

    emit('update:images', [...props.images, ...uploadedImages])
    showMessage('Upload successful')
  } catch (error) {
    showError(error)
  } finally {
    uploading.value = false
    // Clear file selection
    event.target.value = ''
  }
}

// Remove Image
const removeImage = (index) => {
  const newImages = [...props.images]
  newImages.splice(index, 1)
  emit('update:images', newImages)
}

// Load Initial Images on Initialization
onMounted(() => {
  if (props.initialImages?.length) {
    emit('update:images', [...props.initialImages])
  }
})
</script>

<style scoped>
.image-item {
  position: relative;
  aspect-ratio: 1;
}

.image-actions {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 0 0 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.image-upload-btn {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-upload-btn:hover {
  border-color: var(--v-theme-primary);
}
</style> 