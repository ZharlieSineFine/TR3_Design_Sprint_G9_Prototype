const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
})

module.exports = Chat 