var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    config = require('./config'),
    levelup = require('levelup'),
    db = levelup(config.db)

var server = app.listen(config.port)
console.log('server listening at port' + config.port)

// Enable CORS from client-side
app.use(function(req, res, next) { 
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials")
  res.header("Access-Control-Allow-Credentials", "true")
  next()
})

