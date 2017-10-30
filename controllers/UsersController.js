"use strict"

const models = require('../models'),
  express = require('express'),
  router = express.Router(),
  recaptcha = require('../services/recaptcha'),
  jwt = require("jsonwebtoken"),
  jwtConfig = require('../config/jwt.json'),
  mailer = require('../services/email'),
  policies = require('../services/policies')

router.route('/users')

/**
 * Get all
 */
.get((req, res) => {
  models.user.findAll().then(users => {
    res.json(users)
  })
})

/**
 * Create one
 */
.post((req, res) => {
  let userObj = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmation: req.body.passwordConfirmation
  }
  if (req.body.recaptchaToken && req.body.cgvCheckbox) { // Test si les paramètres sont envoyés
    recaptcha.validate(req.body.recaptchaToken).then(() => { // racaptcha
      if (req.body.cgvCheckbox) { // confirmation cgv
        if (req.body.lastname && req.body.firstname && req.body.email && req.body.password && req.body.passwordConfirmation) { // Test si les paramètres de l'utilisateur sont envoyés
          models.user.findOne({ where: { email: req.body.email } }).then((user) => {
            if (!user) {
              models.user.sync().then(() => {
                return models.user.create(userObj).then(user => {
                  mailer.sendSignupEmail(user).then(() => {
                    res.json({ message: 'User created' })
                  }).catch(function(errors) {
                    res.json({ errors: errors })
                  })
                }).catch(models.Sequelize.Error, function(errors) {
                  return res.json({ errors: ["User validation error"] })
                })
              })
            } else res.json({ errors: ['Email already taken'] })
          })
        } else res.json({ errors: ["allFieldsRequired"] })
      } else res.json({ errors: ["cgv"] })
    }).catch((recaptchaErrorCodes) => {
      res.json({ errors: [recaptcha.translateErrors(recaptchaErrorCodes)] })
    })
  } else return res.json({ errors: ["captcha", "cgv"] })
})

router.route('/users/confirmation')

/**
 * Email validation
 */
.post((req, res) => {
  if (req.body.token) {
    models.user.update({
      activated: true,
    }, {
      where: {
        emailConfirmationToken: req.body.token
      }
    }).then(() => {
      res.json({ message: 'Email verified' })
    }).catch(() => {
      res.json({ errors: ['Verification error'] })
    })
  } else {
    res.json({ errors: ['No token given'] })
  }
})

router.route('/users/login')

/**
 * Login
 */
.post(function(req, res) {
  if (req.body.email && req.body.password) {
    models.user.findOne({
      where: {
        email: req.body.email
      }
    }).then((user) => {
      if (user) {
        if (user.checkPassword(req.body.password)) {
          if (user.activated) {
            if (!user.blocked) {
              var payload = { id: user.id }
              var token = jwt.sign(payload, jwtConfig.secret, { expiresIn:   '30d' })
              res.json({ jwt: token })
            } else res.json({ errors: ['Account blocked'] })
          } else res.json({ errors: ['Verified your email first'] })
        } else res.sendStatus(400)
      } else res.sendStatus(400)
    }).catch((errors) => {
      res.sendStatus(401)
    })
  } else res.sendStatus(401)
})

router.route('/users/profile')

.get(policies.isLoggedIn(), (req, res) => {
  models.user.findOne({
    where: {
      id: req.user.id
    },
    include: [{
      model: models.list,
      as: 'Lists'
    }, {
      model: models.list,
      as: 'Collaborations'
    }],
    attributes: ['id', 'firstname', 'lastname', 'email', 'createdAt', 'updatedAt']
  }).then((user) => {
    if (user) res.json(user)
    else res.sendStatus(401)
  }).catch((errors) => {
    console.log(errors)
  })
})
router.route('/users/:id')

/**
 * Delete one
 */
.delete(policies.isLoggedIn(), (req, res) => {
  policies.isOwner(req.user, { user: req.user, id: req.params.id }).then(() => {
    models.user.destroy({
      where: {
        id: req.params.id
      }
    }).then(() => {
      res.json('User deleted')
    })
  })
})

module.exports = router
