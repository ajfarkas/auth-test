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

// `password` is `string`
User.hashPass = function(password, next) {
  var SaltFactor = 5

  bcrypt.genSalt(SaltFactor, function(err, salt) {
    if (err) {
      return console.error(err)
    }

    bcrypt.hash(password, salt, null, function(errB, hash) {
      if (errB) {
        return console.error(errB)
      }
      next(hash)
    })
  })

}
/* `candidate` is user-input password `string`
 * `hashedPass` is saved and hashed password `string`
 * `next` is callback function, which is passed an `error` and `boolean`
*/
User.comparePass = function(candidate, hashedPass, next) {
  console.log("comparepass: "+candidate, hashedPass)
  return bcrypt.compare(candidate, hashedPass, function(err, isMatch) {
    if (typeof next === 'function') {
      if (err) {
        return next(err)
      }
      return next(null, isMatch)
    } else {
      if (err) {
        return console.error(err)
      }
      return isMatch
    }
  })
}

/* `data` is `json object` of UserSchema
 * `next` is callback function, which is passed the user object
*/
User.createUser = function(data, next) {
  var user = {  
    email: data.email.toLowerCase(),
    profile: data.profile,
    role: data.role || 'Member',
    resetPasswordToken: data.resetPasswordToken || null,
    resetPasswordExpires: data.resetPasswordExpires || null
  }

  User.hashPass(data.password, function(hash) {
    user.hash = hash
    user._id = uuid.v4()
    next(user)
  })
  
}

module.exports = User
