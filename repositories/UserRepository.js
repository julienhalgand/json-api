"use strict"

const models = require('../models')

module.exports = {
  all: () => {
    models.user.findAll().then(users => {
      res.json(users)
    })
  },
  create: () => {

  }
}
