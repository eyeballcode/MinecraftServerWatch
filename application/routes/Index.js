const express = require('express')
const router = new express.Router()

const LogWatcher = require('../modules/LogWatcher')
let logWatcher = new LogWatcher(config.logfile)

router.get('/full-log', (req, res) => {
  res.end(JSON.stringify(logWatcher.getFullLog()))
})

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
module.exports.logWatcher = logWatcher
