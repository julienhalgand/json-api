"use strict"

const bcrypt = require('bcrypt-nodejs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    firstname: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isAlpha: true,
        len: [2, 30]
      }
    },
    lastname: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isAlpha: true,
        len: [2, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
        len: [6, 50]
      },
      set: function(val) {
        this.setDataValue('email', val.toLowerCase())
      }
    },
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true,
        is: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        len: [8, 20]
      },
      set: function(val) {
        this.setDataValue('password', val)
        var salt = bcrypt.genSaltSync(8)
        this.setDataValue('encryptedPassword', bcrypt.hashSync(val, salt))
      }
    },
    passwordConfirmation: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true
      }
    },
    encryptedPassword: DataTypes.STRING,
    emailConfirmationToken: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    role: {
      type: DataTypes.STRING,
      validate: {
        isIn: [
          ['user', 'modo', 'admin']
        ]
      },
      defaultValue: 'user'
    }
  })

  User.associate = (models) => {
    User.hasMany(models.list, { as: 'Lists' })
    User.hasMany(models.sharing_link, { as: 'SharingLinks' })
    User.belongsToMany(models.list, { as: 'Collaborations', through: 'user_lists', foreignKey: 'userId' })
  }

  User.beforeCreate(function(user, options, callback) {
    if (user.password != user.passwordConfirmation) {
      throw new Error("Password and confirmation aren't the same")
    }
  })

  User.prototype.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.encryptedPassword)
  }

  return User
}
