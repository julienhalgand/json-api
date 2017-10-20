'use strict'

const models = require('../models'),
  express = require('express'),
  policies = require('../services/policies'),
  router = express.Router(),
  Task = models.task

router.route('/tasks')

.post(policies.isLoggedIn(), (req, res, next) => {
    policies.isListOwner(req, res).then((list) => {
      if (list) {
        Task.sync().then(() => {
          return Task.create({
            description: req.body.description,
            completed: false,
            archived: false,
            listId: req.body.listId
          }).then(task => {
            res.json(task.dataValues)
          })
        })
      }
    })
  })
  /*
  .get(function(req, res) {
    Task.findAll().then(tasks => {
      res.json(tasks)
    })
  })
  */
  /**
   * Task update delete
   */
router.route('/tasks/:id')

// update the list with this id
.put(policies.isLoggedIn(), (req, res, next) => {
  policies.isTaskOwner(req, res).then((list) => {
    if (list) {
      var updatedTask = {
        description: req.body.description,
        completed: req.body.completed
      }
      Task.update(updatedTask, {
        where: {
          id: req.params.id
        }
      }).then(task => {
        res.json(task)
      })
    }
  })
})

// delete the list with this id
.delete(policies.isLoggedIn(), (req, res, next) => {
  policies.isTaskOwner(req, res).then((list) => {
    if (list) {
      Task.destroy({
        where: {
          id: req.params.id
        }
      }).then(() => {
        res.json('Task deleted')
      })
    }
  })
})

module.exports = router
