const express = require('express')
const router = new express.Router()

const LogWatcher = require('../modules/LogWatcher')
const PlayerWatcher = require('../modules/PlayerWatcher')

let logWatcher = new LogWatcher(config.logfile)
let playerWatcher = new PlayerWatcher(logWatcher)

router.get('/full-log', (req, res) => {
  res.end(JSON.stringify(logWatcher.getFullLog()))
})

router.get('/players', (req, res) => {
  res.end(JSON.stringify(playerWatcher.getPlayers()))
})

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
module.exports.logWatcher = logWatcher
module.exports.playerWatcher = playerWatcher
