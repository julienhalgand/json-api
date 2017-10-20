'use strict'

const models = require('../models'),
  express = require('express'),
  passport = require('passport'),
  policies = require('../services/policies'),
  router = express.Router(),
  List = models.list,
  Task = models.task

router.route('/lists')

/**CREATE */

.post(policies.isLoggedIn(), (req, res) => {
  List.sync().then(() => {
    return List.create({
      title: req.body.title,
      archived: false,
      userId: req.user.id
    }).then(list => {
      res.json({ id: list.dataValues.id })
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
  List.findAll({
    where: {
      isPublic: true,
      archived: false
    }
  }).then(lists => {
    res.json(lists)
  })
})

router.route('/lists/public/:id')

.get((req, res, next) => {
  policies.isPublicList(req, res, next).then((list) => {
    res.json(list)
  })
})

router.route('/lists/share/:id')

.get((req, res, next) => {
  policies.isValidSharingLink(req, res, next).then((sharingLink) => {
    res.json(sharingLink)
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
        archived: req.body.archived
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
