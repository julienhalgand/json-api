const passport = require("passport"),
  passportJWT = require("passport-jwt"),
  models = require('../models'),
  ExtractJwt = passportJWT.ExtractJwt,
  Strategy = passportJWT.Strategy,
  jwtConfig = require('../config/jwt.json')

module.exports = () => {
  var strategy = new Strategy({ secretOrKey: jwtConfig.secret, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() }, function(payload, done) {
    models.user.findOne({
      where: {
        id: payload.id
      },
      attributes: ['id', 'role']
    }).then((user) => {
      if (user) {
        return done(null, user)
      } else {
        return done(new Error("User not found"), null)
      }
    }).catch((errors) => {
      console.log(errors)
    })
  })
  passport.serializeUser(function(user, done) {
    done(null, user)
  })

  passport.deserializeUser(function(user, done) {
    done(null, user)
  })
  passport.use(strategy)
  return {
    initialize: function() {
      return passport.initialize()
    },
    authenticate: function() {
      return passport.authenticate("jwt", false)
    }
  }
}
