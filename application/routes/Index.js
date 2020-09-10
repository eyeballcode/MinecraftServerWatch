const express = require('express')
const router = new express.Router()

const LogWatcher = require('../modules/LogWatcher')
const PlayerWatcher = require('../modules/PlayerWatcher')
const ServerStatus = require('../modules/ServerStatus')
const RCON = require('../modules/RCON')

let logWatcher = new LogWatcher(config.logfile)
let playerWatcher = new PlayerWatcher(logWatcher)
let serverStatus = new ServerStatus(config.server, parseInt(config.serverPort), 5000)

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

router.post('/rcon', async (req, res) => {
  let { password, command } = req.body
  let rcon = new RCON()
  await rcon.connect(config.server, config.rconPort, password)
  await rcon.send(command)
  await rcon.end()
})

router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
module.exports.logWatcher = logWatcher
module.exports.playerWatcher = playerWatcher
