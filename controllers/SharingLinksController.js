'use strict'

const models = require('../models'),
  express = require('express'),
  uuidv4 = require('uuid/v4'),
  policies = require('../services/policies'),
  router = express.Router(),
  SharingLink = models.sharing_link

router.route('/sharinglink/renew/:id')

// update the list with this id
.patch(policies.isLoggedIn(), (req, res, next) => {
  policies.isSharingLinkOwner(req, res).then((sharingLink) => {
    if (sharingLink) {
      console.log('uinrsteuian')
      sharingLink.update({ url: uuidv4() }).then(sharingLink => {
        res.json(sharingLink)
      })
    } else res.status(404)
  })
})

module.exports = router
