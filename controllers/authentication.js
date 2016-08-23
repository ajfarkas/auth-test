var Export = {}
var jwt = require('jsonwebtoken'),
    crypto = require('crypto'),
    user = require('../models/user'),
    config = require('../config/main'),
    db = require('../config/db')

function setUserInfo(req) {
  return {
    _id: req._id,
    firstname: req.profile.firstname,
    lastname: req.profile.lastname,
    email: req.email,
    role: req.role
  }
}

function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 10080 //
  })
}

// Login route
Export.login = function(req, res, next) {
  var userInfo = setUserInfo(req.user)

  res.status(200).json({
    token: 'JWT '+generateToken(userInfo),
    user: userInfo
  })
}

// Registration route
Export.register = function(req, res, next) {
  var email = req.body.email,
      firstname = req.body.firstname,
      lastname = req.body.lastname,
      password = req.body.password,
      userErr = []
  // check for blank fields
  if (!email) {
    userErr.push('You must enter an email address.')
  }
  if (!firstname || !lastname) {
    userErr.push('You must enter your full name.')
  }
  if (!password) {
    userErr.push('you must enter a password.')
  }
  if (userErr.length) {
    return res.status(422).send({ error: userErr })
  }

  db.get('user_'+email, { valueEncoding: 'json' }, function(err, existingUser) {
    if (err && !err.notFound) {
      return next(err)
    }
    if (existingUser) {
      return res.status(422).send({ error: ['That email address is already in use.'] })
    } 

    user.createUser({
      email: email,
      password: password,
      profile: {
        firstname: firstname,
        lastname: lastname
      }
    }, function(newUser) {
      db.put('user_'+newUser.email, newUser, { valueEncoding: 'json' }, function(err) {
        if (err) {
          return console.error('register PUT error: '+err)
        }
        console.log('new user created: '+newUser._id)

        delete newUser.hash
        res.status(201).json({
          token: 'JWT '+generateToken(newUser),
          user: newUser
        })
      })
    })

  })
}

function extractJWT(req) {
  var auth = req.headers.authorization
  if (auth && auth.match(/^JWT\s.*/)) {
    return auth.replace('JWT ', '')
  } else {
    throw new Error('No JWT in headers.')
  }
}

// Role Authorization
Export.roleAuthorization = function(role) {
  return function(req, res, next) {
    try {
      var user = jwt.verify(extractJWT(req), config.secret)
    } catch(err) {
      return next('Unauthorized. Invalid JWT. '+err)
    }

    db.get('user_'+user.email, { valueEncoding: 'json' }, function(err, foundUser) {
      if (err) {
        res.status(422).json({ error: ['Your login details could not be verified. Please try again.'] })
        return next(err)
      }

      if (foundUser.role === role) {
        return next()
      } else {
        res.status(401).json({ error: ['You are not authorized to view this content.'] })
        return next('Unauthorized')
      }
    })
  }
}

// User Permission Authorization
Export.authProtectedContent = function(content) {
  return function(req, res, next) {
    try {
      var user = jwt.verify(extractJWT(req), config.secret)
    } catch(err) {
      return next('Unauthorized. Invalid JWT.')
    }

    db.get('content_'+content, function(err, data) {
      if (err) {
        res.status(422).json({ error: ['Your login details could not be verified. Please try again.'] })
        return next(err)
      }

      if (data.users && data.users.indexof(user._id) >= 0) {
        res.status(200).json({ content: 'yes, have some.' })
      } else {
        res.status(401).json({ error: ['You are not authorized to view this content.'] })
        return next('Unauthorized')
      }
    })
  }
}

module.exports = Export