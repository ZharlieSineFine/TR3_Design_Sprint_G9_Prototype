const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 200
  }
})

module.exports = Group 