'use strict'

const models = require('../models'),
  express = require('express'),
  policies = require('../services/policies'),
  router = express.Router(),
  SharingLink = models.sharing_link

router.route('/sharing')

.post(policies.isLoggedIn(), (req, res, next) => {
    policies.isListOwner(req, res).then((list) => {
      if (list) {
        SharingLink.sync().then(() => {
          return SharingLink.create({
            description: req.body.description,
            completed: false,
            archived: false,
            listId: req.body.listId
          }).then(sharingLink => {
            res.json(sharingLink.dataValues)
          })
        })
      }
    })
  })
  /*
  .get(function(req, res) {
    SharingLink.findAll().then(sharingLinks => {
      res.json(sharingLinks)
    })
  })
  */
  /**
   * SharingLink update delete
   */
router.route('/sharing/:id')

// update the list with this id
.put(policies.isLoggedIn(), (req, res, next) => {
  policies.isTaskOwner(req, res).then((list) => {
    if (list) {
      var updatedTask = {
        description: req.body.description,
        completed: req.body.completed
      }
      SharingLink.update(updatedTask, {
        where: {
          id: req.params.id
        }
      }).then(sharingLink => {
        res.json(sharingLink)
      })
    }
  })
})

// delete the list with this id
.delete(policies.isLoggedIn(), (req, res, next) => {
  policies.isTaskOwner(req, res).then((list) => {
    if (list) {
      SharingLink.destroy({
        where: {
          id: req.params.id
        }
      }).then(() => {
        res.json('SharingLink deleted')
      })
    }
  })
})

module.exports = router
