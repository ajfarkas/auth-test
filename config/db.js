var levelup = require('levelup'),
    config = require('./main'),
    db = levelup(config.db)

module.exports = db