var bcrypt = require('bcrypt-nodejs'),
    uuid = require('node-uuid')

var User = {}
User.UserSchema = {  
  email: {
    type: 'string',
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: 'string',
    required: true
  },
  profile: {
    firstName: { type: 'string' },
    lastName: { type: 'string' }
  },
  role: {
    type: 'string',
    enum: ['Member', 'Owner', 'Admin'],
    default: 'Member'
  },
  resetPasswordToken: { type: 'string' },
  resetPasswordExpires: { type: 'date' }
}

// `data` is `json object` of UserSchema
User.createUser = function(data) {
  var user = {}
  Object.keys(User.UserSchema).forEach(function(key) {
    var reqs = User.UserSchema[key]
    if (reqs.required && !data[key]) {
      return new Error('required field '+key+' not passed to User.createUser!')
    } else if (!reqs.required && !data[key]) {
      if (reqs.default) {
        user[key] = reqs.default
      } else {
        user[key] = null
      }
    }

    if (reqs.type !== typeof key &&
               (reqs.type === 'date' && (!data[key] instanceof Date)) ) {
      return new Error('typeof '+key+' does not match UserSchema!')
    }

    if (reqs.enum && reqs.enum.indexOf(data[key]) < 0) {
      user[key] = reqs.default
    } else if (key === 'profile') {
      user[key] = {}
      var nestedKeys = Object.keys(reqs)
      nestedKeys.forEach(function(nKey) {
        var nReq = reqs[nKey]
        if (typeof nKey !== nReq.type) {
          return new Error('typeof '+nKey+' does not match UserSchema!')
        }

        user[key][nKey] = data[key][nKey]
      })
    } else {
      if (reqs.lowercase) {
        user[key] = data[key].toLowerCase()
      } else {
        user[key] = data[key]
      }
    }
  })

  user._id = uuid.v4()
  return user
}
// `password` is `string`
User.hashPass = function(password) {
  var SaltFactor = 5

  bcrypt.genSalt(SaltFactor, function(err, salt) {
    if (err) {
      return console.error(err)
    }

    bcrypt.hash(password, salt, null, function(errB, hash) {
      if (errB) {
        return console.error(errB)
      }

      password = hash
    })
  })

  return password
}
/* `candidate` is user-input password `string`
 * `hashedPass` is saved and hashed password `string`
 * `cb` is callback function, which is passed an `error` and `boolean`
*/
User.comparePass = function(candidate, hashedPass, cb) {
  return bcrypt.compare(candidate, hashedPass, function(err, isMatch) {
    if (typeof cb === 'function') {
      if (err) {
        return cb(err)
      }
      return cb(null, isMatch)
    } else {
      if (err) {
        return console.error(err)
      }
      return isMatch
    }
  })
}


module.exports = User
