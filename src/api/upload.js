import api from './index'

export const uploadApi = {
  // 上传图片
  uploadImage(formData) {
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 上传文件
  uploadFile(formData) {
    return api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除文件
  deleteFile(fileUrl) {
    return api.delete('/upload/file', {
      params: { url: fileUrl }
    })
  }
} 