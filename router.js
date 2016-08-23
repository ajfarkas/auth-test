var authenticationController = require('./controllers/authentication'),
    express = require('express'),
    passportService = require('./config/passport'),
    passport = require('passport')

var requireAuth = passport.authenticate('jwt', { session: false })
var requireLogin = passport.authenticate('local', { session: false })

var REQUIRE_ADMIN = 'Admin',
    REQUIRE_OWNER = 'Owner',
    REQUIRE_MEMBER = 'Member'

module.exports = function(app) {
  var apiRoutes = express.Router(),
      authRoutes = express.Router()

  apiRoutes.use('/auth', authRoutes)
  apiRoutes.get('/test', requireAuth, function(req, res, next) {
    res.status(200).json({
      success: 'authenticated user!',
      headers: Object.keys(req.headers),
      authinfo: req.headers.authorization
    })
  })

  authRoutes.post('/register', authenticationController.register)

  authRoutes.post('/login', requireLogin, authenticationController.login)

  app.use('/api', apiRoutes)
}