// 聊天相关接口
export const chatApi = {
  // 获取聊天列表
  getChatList() {
    return api.get('/chats')
  },

  // 创建聊天
  createChat(targetId) {
    return api.post('/chats', { targetId })
  },

  // 获取消息列表
  getMessages(chatId, params) {
    return api.get(`/chats/${chatId}/messages`, { params })
  },

  // 发送消息
  sendMessage(chatId, data) {
    return api.post(`/chats/${chatId}/messages`, data)
  },

  // 撤回消息
  revokeMessage(chatId, messageId) {
    return api.post(`/chats/${chatId}/messages/${messageId}/revoke`)
  },

  // 标记已读
  markAsRead(chatId) {
    return api.post(`/chats/${chatId}/read`)
  },

  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData)
  },

  // 上传语音
  uploadVoice(blob) {
    const formData = new FormData()
    formData.append('file', blob, 'voice.mp3')
    return api.post('/upload/voice', formData)
  },

  // 群聊相关接口
  // 创建群聊
  createGroup(data) {
    return api.post('/groups', data)
  },

  // 获取群聊详情
  getGroup(groupId) {
    return api.get(`/groups/${groupId}`)
  },

  // 更新群聊信息
  updateGroup(groupId, data) {
    return api.put(`/groups/${groupId}`, data)
  },

  // 解散群聊
  dismissGroup(groupId) {
    return api.delete(`/groups/${groupId}`)
  },

  // 获取群成员列表
  getGroupMembers(groupId) {
    return api.get(`/groups/${groupId}/members`)
  },

  // 邀请群成员
  inviteGroupMembers(groupId, userIds) {
    return api.post(`/groups/${groupId}/members`, { userIds })
  },

  // 移除群成员
  removeGroupMember(groupId, userId) {
    return api.delete(`/groups/${groupId}/members/${userId}`)
  },

  // 退出群聊
  leaveGroup(groupId) {
    return api.post(`/groups/${groupId}/leave`)
  },

  // 获取可邀请的用户列表
  getAvailableUsers() {
    return api.get('/users/available')
  },

  // 获取群聊消息列表
  getGroupMessages(groupId, params) {
    return api.get(`/groups/${groupId}/messages`, { params })
  },

  // 发送群聊消息
  sendGroupMessage(groupId, data) {
    return api.post(`/groups/${groupId}/messages`, data)
  },

  // 撤回群聊消息
  revokeGroupMessage(groupId, messageId) {
    return api.post(`/groups/${groupId}/messages/${messageId}/revoke`)
  },

  // 获取群聊通知设置
  getGroupNotificationSettings(groupId) {
    return api.get(`/groups/${groupId}/notification-settings`)
  },

  // 更新群聊通知设置
  updateGroupNotificationSettings(groupId, data) {
    return api.put(`/groups/${groupId}/notification-settings`, data)
  },

  // 获取群聊文件列表
  getGroupFiles(groupId, params) {
    return api.get(`/groups/${groupId}/files`, { params })
  },

  // 上传群聊文件
  uploadGroupFile(groupId, file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/groups/${groupId}/files`, formData)
  },

  // 删除群聊文件
  deleteGroupFile(groupId, fileId) {
    return api.delete(`/groups/${groupId}/files/${fileId}`)
  },

  // 获取群聊公告列表
  getGroupAnnouncements(groupId, params) {
    return api.get(`/groups/${groupId}/announcements`, { params })
  },

  // 发布群聊公告
  createGroupAnnouncement(groupId, data) {
    return api.post(`/groups/${groupId}/announcements`, data)
  },

  // 删除群聊公告
  deleteGroupAnnouncement(groupId, announcementId) {
    return api.delete(`/groups/${groupId}/announcements/${announcementId}`)
  },

  // 获取群聊统计信息
  getGroupStatistics(groupId) {
    return api.get(`/groups/${groupId}/statistics`)
  },

  // 获取群聊邀请链接
  getGroupInviteLink(groupId) {
    return api.get(`/groups/${groupId}/invite-link`)
  },

  // 通过邀请链接加入群聊
  joinGroupByInviteLink(inviteCode) {
    return api.post(`/groups/join/${inviteCode}`)
  },

  // 转让群主
  transferGroupOwnership(groupId, newOwnerId) {
    return api.post(`/groups/${groupId}/transfer-ownership`, { newOwnerId })
  },

  // 禁言群成员
  muteGroupMember(groupId, userId, duration) {
    return api.post(`/groups/${groupId}/members/${userId}/mute`, { duration })
  },

  // 解除群成员禁言
  unmuteGroupMember(groupId, userId) {
    return api.post(`/groups/${groupId}/members/${userId}/unmute`)
  },

  // 获取群聊禁言列表
  getGroupMutedMembers(groupId) {
    return api.get(`/groups/${groupId}/muted-members`)
  }
} 