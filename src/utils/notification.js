import { ref } from 'vue'
import { notificationApi } from '@/api'

class NotificationManager {
  constructor() {
    this.unreadCount = ref(0)
    this.pollingInterval = null
    this.callbacks = new Set()
    this.notificationSound = new Audio('/sounds/notification.mp3')
    this.loadSettings()
  }

  // Load settings
  loadSettings() {
    const savedSettings = localStorage.getItem('notificationSettings')
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      desktop: false,
      sound: true,
      types: ['like', 'comment', 'follow', 'system'],
      interval: 30000
    }
  }

  // Update settings
  updateSettings(settings) {
    this.settings = settings
    // Update polling interval
    if (this.pollingInterval) {
      this.startPolling(settings.interval)
    }
  }

  // Play notification sound
  playNotificationSound() {
    if (this.settings.sound) {
      this.notificationSound.play().catch(error => {
        console.warn('Failed to play notification sound:', error)
      })
    }
  }

  // Show notification
  async showNotification(notification) {
    // Check if notification type is enabled
    if (!this.settings.types.includes(notification.type)) {
      return
    }

    // Play sound
    this.playNotificationSound()

    // Show desktop notification
    if (this.settings.desktop) {
      await this.showDesktopNotification(notification)
    }
  }

  // Start polling
  startPolling(interval = 30000) {
    this.stopPolling()
    this.pollingInterval = setInterval(() => {
      this.checkNewNotifications()
    }, interval)
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // Check new notifications
  async checkNewNotifications() {
    try {
      const count = await notificationApi.getUnreadCount()
      if (count > this.unreadCount.value) {
        // Get new notifications
        const { data } = await notificationApi.getNotifications({
          page: 1,
          pageSize: count - this.unreadCount.value
        })
        // Show new notifications
        data.forEach(notification => this.showNotification(notification))
      }
      this.unreadCount.value = count
      this.notifySubscribers()
    } catch (error) {
      console.error('Failed to check notifications:', error)
    }
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  // Notify subscribers
  notifySubscribers() {
    this.callbacks.forEach(callback => callback(this.unreadCount.value))
  }

  // Reset state
  reset() {
    this.unreadCount.value = 0
    this.stopPolling()
    this.callbacks.clear()
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // Show desktop notification
  async showDesktopNotification(notification) {
    if (await this.requestNotificationPermission()) {
      const title = notification.title
      const options = {
        body: notification.content,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        renotify: true
      }

      const desktopNotification = new Notification(title, options)
      desktopNotification.onclick = () => {
        window.focus()
        // Handle click event based on notification type
        switch (notification.type) {
          case 'like':
          case 'comment':
            window.location.href = `/forum/post/${notification.targetId}`
            break
          case 'follow':
            window.location.href = `/user/${notification.fromUser.id}`
            break
        }
        desktopNotification.close()
      }
    }
  }
}

export const notificationManager = new NotificationManager() 