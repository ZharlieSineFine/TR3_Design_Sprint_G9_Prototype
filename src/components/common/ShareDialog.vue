<template>
  <v-dialog v-model="show" max-width="500">
    <v-card>
      <v-card-title>Share</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="item in shareItems"
            :key="item.type"
            @click="handleShare(item.type)"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" :color="item.color" />
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <v-divider class="my-3" />
        
        <v-text-field
          v-model="shareUrl"
          label="Share URL"
          readonly
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copyUrl"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from '@/utils/message'

const { showMessage } = useMessage()
const show = ref(false)
const shareUrl = ref('')

const shareItems = [
  { type: 'wechat', title: 'WeChat', icon: 'mdi-wechat', color: '#07C160' },
  { type: 'weibo', title: 'Weibo', icon: 'mdi-sina-weibo', color: '#E6162D' },
  { type: 'qq', title: 'QQ', icon: 'mdi-qqchat', color: '#12B7F5' }
]

const handleShare = (type) => {
  // Implement sharing logic based on different platforms
  console.log('Share to:', type)
  show.value = false
}

const copyUrl = () => {
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    showMessage('URL copied')
  })
}

// Open the share dialog
const openShare = (url) => {
  shareUrl.value = url
  show.value = true
}

defineExpose({
  openShare
})
</script> 