export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  // Today
  if (d.toDateString() === now.toDateString()) {
    return formatTime(d)
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday ' + formatTime(d)
  }

  // This week
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return weekDays[d.getDay()] + ' ' + formatTime(d)
  }

  // This year
  if (d.getFullYear() === now.getFullYear()) {
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  // Other
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// Format time
export const formatTime = (time) => {
  if (!time) return ''
  // If it's a string in HH:mm format, return directly
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    return time
  }
  // If it's a Date object, format it as HH:mm
  if (time instanceof Date) {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  return ''
}

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  // Within 1 minute
  if (diff < 60 * 1000) {
    return 'Just now'
  }

  // Within 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} minutes ago`
  }

  // Within 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} hours ago`
  }

  // Within 30 days
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} days ago`
  }

  // Within 12 months
  if (diff < 12 * 30 * 24 * 60 * 60 * 1000) {
    const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000))
    return `${months} months ago`
  }

  // Other
  const years = Math.floor(diff / (12 * 30 * 24 * 60 * 60 * 1000))
  return `${years} years ago`
}

// Format duration
export const formatDuration = (seconds) => {
  if (!seconds) return '0 seconds'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  seconds = seconds % 60

  let result = ''
  if (hours > 0) result += `${hours} hours`
  if (minutes > 0) result += `${minutes} minutes`
  if (seconds > 0) result += `${seconds} seconds`
  
  return result
} 