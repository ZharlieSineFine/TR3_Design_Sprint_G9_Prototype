<template>
  <v-dialog v-model="show" max-width="500">
    <v-card>
      <v-card-title>举报内容</v-card-title>
      <v-card-text>
        <v-radio-group v-model="form.reason">
          <v-radio
            v-for="item in reasons"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </v-radio-group>

        <v-textarea
          v-model="form.description"
          label="补充说明（选填）"
          rows="3"
          counter
          maxlength="200"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="handleClose">取消</v-btn>
        <v-btn
          color="error"
          :loading="submitting"
          @click="handleSubmit"
        >
          提交举报
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useMessage } from '@/utils/message'

const props = defineProps({
  modelValue: Boolean,
  type: {
    type: String,
    required: true,
    validator: value => ['post', 'comment', 'user'].includes(value)
  },
  targetId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])
const { showMessage, showError } = useMessage()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const submitting = ref(false)
const form = reactive({
  reason: '',
  description: ''
})

// 举报原因选项
const reasons = [
  { value: 'spam', label: '垃圾广告' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'violation', label: '违规内容' },
  { value: 'copyright', label: '侵犯版权' },
  { value: 'other', label: '其他原因' }
]

// 处理提交
const handleSubmit = async () => {
  if (!form.reason) {
    showMessage('请选择举报原因', 'warning')
    return
  }

  try {
    submitting.value = true
    // 这里调用举报API
    await api.post('/reports', {
      type: props.type,
      targetId: props.targetId,
      reason: form.reason,
      description: form.description
    })
    showMessage('举报已提交，我们会尽快处理')
    emit('submitted')
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
  form.reason = ''
  form.description = ''
}
</script> 