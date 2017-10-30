'use strict'

const models = require('../models'),
  express = require('express'),
  passport = require('passport'),
  sequelize = models.sequelize,
  policies = require('../services/policies'),
  taskService = require('../services/TaskService'),
  router = express.Router(),
  User = models.user,
  List = models.list,
  Task = models.task,
  SharingLink = models.sharing_link

router.route('/lists')

/**CREATE */

.post(policies.isLoggedIn(), (req, res) => {
  List.sync().then(() => {
    return List.create({
      title: req.body.title,
      archived: false,
      isPublic: req.body.isPublic,
      userId: req.user.id
    }).then(list => {
      if (list) {
        SharingLink.sync().then(() => {
          return SharingLink.create({
            expirationDate: new Date(),
            listId: list.id,
            userId: req.user.id
          })
        })
        res.json({ id: list.dataValues.id })
      }
    })
  })
})

/**CREATE */
/**GETTERS */

/*
.get(function(req, res) {
  List.findAll().then(lists => {
    res.json(lists)
  })
})
*/
router.route('/lists/archived')

.get((req, res) => {
  List.findAll({
    where: {
      isPublic: true,
      archived: true
    }
  }).then(lists => {
    res.json(lists)
  })
})
router.route('/lists/unarchived')

.get((req, res) => {
  var page = 1
  if (typeof req.query.page != 'undefined') page = req.query.page
  var offset = (page - 1) * 10
  List.findAll({
    where: {
      isPublic: true,
      archived: false
    },
    offset:  offset,
    limit: 10
  }).then(lists => {
    res.json(lists)
  })
})

router.route('/lists/public/:id')

.get((req, res, next) => {
  policies.isPublicList(req, res, next).then((list) => {
    return res.json(list)
  })
})

router.route('/lists/shared/:id')

.get(policies.isLoggedIn(), (req, res, next) => {
  policies.isCollaborator(req, res).then((list) => {
    if (list.Users) {
      res.json(list)
    }
  })
})

router.route('/lists/share/:id')

.get(policies.isLoggedIn(), (req, res, next) => {
  policies.isValidSharingLink(req, res, next).then((sharingLink) => {
    if (sharingLink) {
      User.findById(req.user.id).then((user) => {
        List.findOne({ where: { id: sharingLink.listId } }).then((list) => {
          user.addCollaboration(list).then(() => {
            res.json({ id: list.id })
          })
        })
      })
    } else res.sendStatus(404)
  })
})

router.route('/lists/position/:id')

.patch(policies.isLoggedIn(), (req, res, next) => {
  policies.isCollaborator(req, res).then((list) => {
    if (list) {
      var task = taskService.findTaskInList(list, req.body.taskId)
      var oldTaskPosition = task.position
      var updatedTask = {}
      var newPosition = req.body.moveOf + 1
      if (newPosition > oldTaskPosition) {
        for (var i = oldTaskPosition + 1; i < newPosition + 1; i++) {
          Task.update({ position: i - 1 }, { where: { position: i } })
        }
      } else if (newPosition < oldTaskPosition) {
        for (var i = oldTaskPosition + 1; i > newPosition; i--) {
          Task.update({ position: i }, { where: { position: i - 1 } })
        }
      }
      Task.update({ position: newPosition }, { where: { id: req.body.taskId } })
    }
  })
})

router.route('/lists/collaborator/:id')

.patch(policies.isLoggedIn(), (req, res, next) => {
  policies.isListOwner(req, res).then((list) => {
    if (list) {
      sequelize.query("DELETE FROM `user_lists` WHERE `listId` = " + list.id + " AND `userId` = " + req.body.userId, { type: sequelize.QueryTypes.DELETE }).then(() => {
        res.sendStatus(200)
      })
    }
  })
})

router.route('/lists/stopcollaboration/:id')

.patch(policies.isLoggedIn(), (req, res, next) => {
  policies.isCollaborator(req, res).then((list) => {
    if (list) {
      sequelize.query("DELETE FROM `user_lists` WHERE `listId` = " + list.id + " AND `userId` = " + req.user.id, { type: sequelize.QueryTypes.DELETE }).then(() => {
        res.sendStatus(200)
      })
    }
  })
})

router.route('/lists/:id')

.get(policies.isLoggedIn(), (req, res, next) => {
  policies.isListOwner(req, res).then((list) => {
    return res.json(list)
  })
})

/**GETTERS */
/**UPDATE */

.put(policies.isLoggedIn(), (req, res, next) => {
  policies.isListOwner(req, res).then((list) => {
    if (list) {
      List.update({
        title: req.body.title,
        archived: req.body.archived,
        isPublic: req.body.isPublic
      }, {
        where: {
          id: req.params.id
        }
      }).then(list => {
        res.json(list)
      })
    }
  })
})

/**UPDATE */
/**DELETE */

.delete(policies.isLoggedIn(), (req, res, next) => {
  policies.isListOwner(req, res).then((list) => {
    if (list) {
      List.destroy({
        where: {
          id: req.params.id
        }
      }).then(() => {
        res.json('List deleted')
      })
    }
  })
})

/**DELETE */
module.exports = router
