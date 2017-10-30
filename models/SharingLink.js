"use strict"

module.exports = (sequelize, DataTypes) => {
  const SharingLink = sequelize.define('sharing_link', {
    url: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  })

  return SharingLink
}
