const express = require('express')
const router = new express.Router()

const LogWatcher = require('../modules/LogWatcher')
const PlayerWatcher = require('../modules/PlayerWatcher')
const ServerStatus = require('../modules/ServerStatus')

let logWatcher = new LogWatcher(config.logfile)
let playerWatcher = new PlayerWatcher(logWatcher)
let serverStatus = new ServerStatus(config.server, config.serverPort, 5000)

router.get('/full-log', (req, res) => {
  res.json(logWatcher.getFullLog())
})

router.get('/players', (req, res) => {
  res.json(playerWatcher.getPlayers())
})

router.get('/ping', async (req, res) => {
  await serverStatus.connect()
  res.json(serverStatus.stats)
})

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
module.exports.logWatcher = logWatcher
module.exports.playerWatcher = playerWatcher
