// 防抖函数
export const debounce = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
export const throttle = (fn, delay) => {
  let timer = null
  return (...args) => {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

// 格式化数字
export const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 生成分享链接
export const generateShareUrl = (platform, { url, title, desc }) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDesc = encodeURIComponent(desc)

  switch (platform) {
    case 'weibo':
      return `http://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`
    case 'qq':
      return `http://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}&desc=${encodedDesc}`
    case 'wechat':
      // 微信分享需要使用 SDK
      return url
    default:
      return url
  }
} 