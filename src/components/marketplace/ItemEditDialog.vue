<template>
  <v-dialog
    v-model="show"
    max-width="800px"
    @click:outside="handleClose"
  >
    <v-card>
      <v-card-title>{{ isEdit ? 'Edit Item' : 'Publish Item' }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.title"
            label="Title"
            :rules="[v => !!v || 'Please enter a title']"
            required
          />

          <v-text-field
            v-model.number="form.price"
            label="Price"
            type="number"
            prefix="￥"
            :rules="[
              v => !!v || 'Please enter a price',
              v => v >= 0 || 'Price cannot be negative'
            ]"
            required
          />

          <v-select
            v-model="form.category"
            :items="categories"
            item-title="title"
            item-value="value"
            label="Category"
            :rules="[v => !!v || 'Please select a category']"
            required
          />

          <v-select
            v-model="form.condition"
            :items="conditionOptions"
            item-title="title"
            item-value="value"
            label="Condition"
            :rules="[v => !!v || 'Please select a condition']"
            required
          />

          <rich-editor
            v-model="form.description"
            placeholder="Detailed description..."
            @change="handleDescriptionChange"
          />

          <image-upload
            v-model:images="form.images"
            :initial-images="form.images"
            :max-count="9"
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
          {{ isEdit ? 'Save' : 'Publish' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMessage } from '@/utils/message'
import { marketplaceApi } from '@/api'
import RichEditor from '@/components/common/RichEditor.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'

const props = defineProps({
  modelValue: Boolean,
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const { showMessage, showError } = useMessage()

// 状态
const submitting = ref(false)

// 表单数据
const form = ref({
  title: '',
  price: 0,
  category: null,
  condition: null,
  description: '',
  images: []
})

// 重置表单
const resetForm = () => {
  form.value = {
    title: '',
    price: 0,
    category: null,
    condition: null,
    description: '',
    images: []
  }
}

// 计算属性
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.item)

// 选项
const categories = [
  { title: 'digital', value: 'digital' },
  { title: 'books', value: 'books' },
  { title: 'life', value: 'life' },
  { title: 'clothing', value: 'clothing' },
  { title: 'other', value: 'other' }
]

const conditionOptions = [
  { title: 'new', value: 'new' },
  { title: '90', value: '90' },
  { title: '80', value: '80' },
  { title: '70', value: '70' },
  { title: '60', value: '60' }
]

// 监听外部数据变化
watch(() => props.item, (item) => {
  if (item) {
    const images = Array.isArray(item.images) ? item.images : []
    
    Object.assign(form.value, {
      title: item.title,
      price: item.price,
      category: item.category,
      condition: item.condition,
      description: item.description,
      images: images
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 处理描述变化
const handleDescriptionChange = (content) => {
  form.value.description = content
}

// 处理提交
const handleSubmit = async () => {
  // 表单验证
  if (!form.value.title.trim()) {
    showMessage('Please enter a title', 'warning')
    return
  }

  if (!form.value.price || form.value.price < 0) {
    showMessage('Please enter a valid price', 'warning')
    return
  }

  if (!form.value.category) {
    showMessage('Please select a category', 'warning')
    return
  }

  if (!form.value.condition) {
    showMessage('Please select the condition', 'warning')
    return
  }

  if (!form.value.description.trim()) {
    showMessage('Please enter a product description', 'warning')
    return
  }

  try {
    submitting.value = true
    if (isEdit.value) {
      await marketplaceApi.updateItem(props.item.id, form.value)
      showMessage('Update successful')
    } else {
      await marketplaceApi.createItem(form.value)
      showMessage('Item published successfully')
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