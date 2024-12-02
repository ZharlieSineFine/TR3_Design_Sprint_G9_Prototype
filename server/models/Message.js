const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fromId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'revoke'),
    defaultValue: 'text'
  },
  content: {
    type: DataTypes.TEXT
  }
})

module.exports = Message 