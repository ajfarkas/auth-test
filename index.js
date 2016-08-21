// from http://blog.slatepeak.com/refactoring-a-basic-authenticated-api-with-node-express-and-mongo/

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    config = require('./config/main'),
    levelup = require('levelup')

var server = app.listen(config.port)
console.log('server listening at port ' + config.port)

// Enable CORS from client-side
app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials")
  res.header("Access-Control-Allow-Credentials", "true")
  next()
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var router = require('./router')
router(app)