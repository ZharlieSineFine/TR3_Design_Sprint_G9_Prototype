const User = require('./User')
const Chat = require('./Chat')
const Message = require('./Message')
const Group = require('./Group')
const GroupMember = require('./GroupMember')
const GroupMessage = require('./GroupMessage')

// 聊天关联
Chat.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId'
})

Chat.belongsTo(User, {
  as: 'target',
  foreignKey: 'targetId'
})

Chat.belongsTo(Message, {
  as: 'lastMessage',
  foreignKey: 'lastMessageId'
})

Message.belongsTo(Chat, {
  foreignKey: 'chatId'
})

Message.belongsTo(User, {
  as: 'from',
  foreignKey: 'fromId'
})

// 群聊关联
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: 'groupId'
})

User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: 'userId'
})

GroupMember.belongsTo(Group, {
  foreignKey: 'groupId'
})

GroupMember.belongsTo(User, {
  foreignKey: 'userId'
})

GroupMessage.belongsTo(Group, {
  foreignKey: 'groupId'
})

GroupMessage.belongsTo(User, {
  as: 'from',
  foreignKey: 'fromId'
})

module.exports = {
  User,
  Chat,
  Message,
  Group,
  GroupMember,
  GroupMessage
} 