<template>
  <v-dialog
    v-model="show"
    max-width="800px"
    @click:outside="handleClose"
  >
    <v-card>
      <v-card-title>{{ isEdit ? 'Edit Post' : 'Create New Post' }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.title"
            label="Title"
            :rules="[v => !!v || 'Please enter a title']"
            required
          />

          <rich-editor
            v-model="form.content"
            placeholder="Share your thoughts..."
            @change="handleContentChange"
          />

          <image-upload
            v-model:images="form.images"
            :max-count="9"
          />

          <v-select
            v-model="form.category"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Category"
            :rules="[v => !!v || 'Please select a category']"
            required
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="handleClose">Cancel</v-btn>
        <v-btn
          color="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ isEdit ? 'Save' : 'Post' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import RichEditor from '@/components/common/RichEditor.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { useMessage } from '@/utils/message'
import { postApi } from '@/api'

const props = defineProps({
  modelValue: Boolean,
  post: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { showMessage, showError } = useMessage()

// 重置表单
const resetForm = () => {
  Object.assign(form.value, {
    title: '',
    content: '',
    category: null,
    images: []
  })
}

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.post)
const submitting = ref(false)

// 表单数据
const form = ref({
  title: '',
  content: '',
  category: null,
  images: []
})

// 监听外部数据变化
watch(() => props.post, (post) => {
  if (post) {
    Object.assign(form.value, {
      title: post.title,
      content: post.content,
      category: post.category?.id,
      images: [...(post.images || [])]
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 处理内容变化
const handleContentChange = (content) => {
  form.value.content = content
}

// 处理提交
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.title.trim()) {
    showMessage('Please enter a title', 'warning')
    return
  }

  if (!form.value.content.trim()) {
    showMessage('Please enter content', 'warning')
    return
  }

  if (!form.value.category) {
    showMessage('Please select a category', 'warning')
    return
  }

  try {
    submitting.value = true
    if (isEdit.value) {
      await postApi.updatePost(props.post.id, form.value)
      showMessage('Updated successfully')
    } else {
      await postApi.createPost(form.value)
      showMessage('Posted successfully')
    }
    emit('saved')
    handleClose()
  } catch (error) {
    showError(error)
  } finally {
    submitting.value = false
  }
}

// 处理关闭
const handleClose = () => {
  show.value = false
  if (!isEdit.value) {
    resetForm()
  }
}
</script> 