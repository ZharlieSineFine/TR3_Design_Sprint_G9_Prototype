<template>
  <div class="rich-editor">
    <quill-editor
      v-model:content="content"
      :options="editorOptions"
      contentType="html"
      @update:content="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const content = ref(props.modelValue)

// Quill 编辑器配置
const editorOptions = {
  theme: 'snow',
  placeholder: props.placeholder,
  modules: {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image']
      ]
    },
    clipboard: {
      matchVisual: false
    }
  }
}

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  if (val !== content.value) {
    content.value = val
  }
})

// 处理内容变化
const handleChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style>
.rich-editor {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.ql-editor {
  min-height: 200px;
}

/* 修复工具栏样式 */
.ql-toolbar.ql-snow {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.ql-container.ql-snow {
  border: none;
}
</style> 