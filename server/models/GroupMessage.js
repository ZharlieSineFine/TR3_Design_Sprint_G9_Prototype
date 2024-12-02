const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const GroupMessage = sequelize.define('GroupMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fromId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'voice', 'file', 'revoke'),
    defaultValue: 'text'
  },
  content: {
    type: DataTypes.TEXT
  }
})

module.exports = GroupMessage 