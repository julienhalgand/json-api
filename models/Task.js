"use strict"

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('task', {
    description: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 150]
      }
    },
    completed: DataTypes.BOOLEAN
  })

  return Task
}
