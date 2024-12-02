const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    defaultValue: 'member'
  },
  nickname: {
    type: DataTypes.STRING
  },
  muteEndTime: {
    type: DataTypes.DATE
  }
})

module.exports = GroupMember 