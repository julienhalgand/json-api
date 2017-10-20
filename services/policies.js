'use strict'

const passport = require("passport"),
  models = require('../models'),
  List = models.list,
  Task = models.task,
  SharingLink = models.sharing_link,
  Permission = models.permission

module.exports = {
  isLoggedIn: () => {
    return passport.authenticate('jwt', { session: false })
  },
  isTaskOwner: (req, res) => {
    return Task.findById(req.params.id).then(task => {
      if (task) {
        return List.findById(task.listId).then(list => {
          if (list) {
            if (req.user.id === list.userId) {
              return list
            } else res.sendStatus(403)
          } else res.sendStatus(404)
        })
      } else res.sendStatus(404)
    })
  },
  isListOwner: (req, res) => {
    var listId = req.params.id
    if (typeof req.params.id === 'undefined') listId = req.body.listId
    return List.findById(listId, { include: [{ model: Task, as: 'Tasks' }] }).then(list => {
      if (list) {
        if (req.user.id === list.userId) {
          return list
        } else res.sendStatus(403)
      } else res.sendStatus(404)
    })
  },
  isPublicList: (req, res) => {
    var listUrl = req.params.id
    List.findOne({ where: { url: listUrl } }, { include: [{ model: Task, as: 'Tasks' }] }).then(list => {
      if (list) {
        if (list.isPublic) return list
        else res.sendStatus(404)
      } else res.sendStatus(404)
    })
  },
  isValidSharingLink: (req, res) => {
    var sharingLinkUrl = req.params.id
    SharingLink.findOne({ where: { url: sharingLinkUrl } }).then((sharingLink) => {
      if (sharingLink) {
        const dateNow = new Date()
        if (sharingLink.expirationDate < dateNow) res.sendStatus(404)
        else return sharingLink
      } else res.sendStatus(404)
    })
  },
  isAdmin: (req, res) => {
    if (req.user.roles === 'admin') true
    else res.sendStatus(403)
  }
}
