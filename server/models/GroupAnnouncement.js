const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const GroupAnnouncement = sequelize.define('GroupAnnouncement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
})

module.exports = GroupAnnouncement 