'use strict'

const models = require('../models'),
  express = require('express'),
  policies = require('../services/policies'),
  taskService = require('../services/TaskService'),
  router = express.Router(),
  Task = models.task

router.route('/tasks')

.post(policies.isLoggedIn(), (req, res, next) => {
  policies.isCollaborator(req, res).then((list) => {
    if (list) {
      Task.sync().then(() => {
        return Task.create({
          description: req.body.description,
          position: req.body.position,
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

/**
 * Task update
 */
router.route('/tasks/:id')

.put(policies.isLoggedIn(), (req, res, next) => {
  policies.isCollaboratorByTask(req, res).then((list) => {
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

/**
 * Task delete
 */
.delete(policies.isLoggedIn(), (req, res, next) => {
  policies.isCollaboratorByTask(req, res).then((list) => {
    console.log('iuaetn')
    if (list) {
      Task.destroy({
        where: {
          id: req.params.id
        }
      }).then(() => {
        res.json('Task deleted')
      })
      var task = taskService.findTaskInList(list, req.params.id)
      for (var i = task.position;  i < list.Tasks.length; i++) {
        Task.update({ position: i }, {
          where: {
            position: i + 1
          }
        })
      }
    }
  })
})

module.exports = router
