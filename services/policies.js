'use strict'

const passport = require("passport"),
  models = require('../models'),
  List = models.list,
  Task = models.task,
  SharingLink = models.sharing_link,
  User = models.user,
  Permission = models.permission

module.exports = {
  isLoggedIn: () => {
    return passport.authenticate('jwt', { session: false })
  },
  isTaskOwner: (req, res) => {
    return Task.findById(req.params.id).then(task => {
      if (task) {
        return List.findById(task.listId, { include: [{ model: Task, as: 'Tasks' }] }).then(list => {
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
    return List.findById(listId, { include: [{ model: Task, as: 'Tasks' }, { model: SharingLink, as: 'SharingLinks' }, { model: User, as: 'Users' }] }).then(list => {
      if (list) {
        list.Tasks.sort(function(a, b) {
          return parseFloat(a.position) - parseFloat(b.position)
        })
        if (req.user.id === list.userId) {
          return list
        } else {
          console.log(req.user.id, list.userId)
          res.sendStatus(403)
        }
      } else res.sendStatus(404)
    })
  },
  isPublicList: (req, res) => {
    var listUrl = req.params.id
    return List.findOne({ where: { url: listUrl }, include: [{ model: Task, as: 'Tasks' }] }).then(list => {
      if (list) {
        if (list.isPublic) {
          list.Tasks.sort(function(a, b) {
            return parseFloat(a.position) - parseFloat(b.position)
          })
          return list
        } else res.sendStatus(404)
      } else res.sendStatus(404)
    })
  },
  isValidSharingLink: (req, res) => {
    var sharingLinkUrl = req.params.id
    return SharingLink.findOne({ where: { url: sharingLinkUrl } }).then((sharingLink) => {
      if (sharingLink) {
        return sharingLink
      } else res.sendStatus(404)
    })
  },
  isSharingLinkOwner: (req, res) => {
    var sharingLinkUrl = req.params.id
    return SharingLink.findOne({ where: { url: sharingLinkUrl } }).then((sharingLink) => {
      if (sharingLink) {
        if (sharingLink.userId === req.user.id) return sharingLink
        else res.sendStatus(404)
      } else res.sendStatus(404)
    })
  },
  isCollaborator: (req, res) => {
    var listId = req.params.id
    if (typeof req.params.id === 'undefined') listId = req.body.listId
    return List.findById(listId, { include: [{ model: Task, as: 'Tasks' }, { model: User, as: 'Users' }] }).then(list => {
      if (list) {
        if (list.userId === req.user.id) {
          return list
        } else {
          if (list.Users.find(function(collaborator) {
              return collaborator.id === req.user.id
            })) {
            return list
          } else return res.sendStatus(403)
        }
      } else return res.sendStatus(404)
    })
  },
  isCollaboratorByTask: (req, res) => {
    var listId = req.params.id
    return Task.findById(req.params.id).then(task => {
      if (task) {
        return List.findById(task.listId, { include: [{ model: Task, as: 'Tasks' }, { model: User, as: 'Users' }] }).then(list => {
          if (list) {
            if (list.userId === req.user.id) {
              return list
            } else {
              if (list.Users.find(function(collaborator) {
                  return collaborator.id === req.user.id
                })) {
                return list
              } else return res.sendStatus(403)
            }
          } else return res.sendStatus(404)
        })
      }
    })
  },
  isAdmin: (req, res) => {
    if (req.user.role === 'admin') return true
    else res.sendStatus(403)
  }
}
