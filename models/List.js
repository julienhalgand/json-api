"use strict"

module.exports = (sequelize, DataTypes) => {
  const List = sequelize.define('list', {
    title: {
      type: DataTypes.STRING,
      validate: {
        len: [1, 150]
      }
    },
    archived: DataTypes.BOOLEAN,
    isPublic: DataTypes.BOOLEAN,
    url: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
  })

  List.associate = (models) => {
    List.hasMany(models.task, { as: 'Tasks' })
    List.hasMany(models.sharing_link, { as: 'SharingLinks' })
  }

  return List
}
