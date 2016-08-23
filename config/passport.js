var passport = require('passport'),
    User = require('../models/user'),
    Config = require('./main'),
    PassportJWT = require('passport-jwt'),
    jwtStrategy = PassportJWT.Strategy,
    extractJWT = PassportJWT.ExtractJwt,
    localStrategy = require('passport-local'),
    db = require('./db')

var localOptions = { usernameField: 'email' }

var loginFail = 'Your login details could not be verified. Please try again.'

var localLogin = new localStrategy(localOptions, function(email, password, done) {
  // call user info from database and use comparePass from User.
  return db.get('user_'+email, { valueEncoding: 'json' }, function(err, data) {
    if (err) {
      if (err.notFound) {
        return done(null, false, { error: loginFail })
      } else {
        return console.error('localLogin, passport.js: '+err)
      }
    }

    User.comparePass(password, data.hash, function(err, isMatch) {
      if (err) {
        console.log("comparePass err: "+err)
        return done(err)
      }

      if (!isMatch) {
        return done(null, false, { error: loginFail })
      }

      return done(null, data)
    })
  })
})


var jwtOptions = {
  // check auth headers
  jwtFromRequest: extractJWT.fromAuthHeader(),
  secretOrKey: Config.secret
}

var jwtLogin = new jwtStrategy(jwtOptions, function(payload, done) {
  console.log('payload: '+payload)
  return db.get('user_'+payload._id, { valueEncoding: 'json' }, function(err, data) {
    if (err) {
      if (err.notFound) {
        return done(null, false)
      }
      return done(err, false)
    }

    return done(null, data)
  })
})

passport.use(jwtLogin)
passport.use(localLogin)