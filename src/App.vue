<template>
  <v-app>
    <app-layout>
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </app-layout>
    <message ref="messageRef" />
  </v-app>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Message from '@/components/common/Message.vue'
import { useUserStore } from '@/stores/user'

const messageRef = ref(null)
const userStore = useUserStore()

onMounted(() => {
  userStore.initUser()
  // 注册全局消息方法
  const app = getCurrentInstance()?.proxy
  if (app) {
    app.$message = messageRef.value
  }
})
</script>

<style>
.v-application {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style> 