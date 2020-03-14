const Index = require('./Index')
const ws = require('ws')

let { logWatcher, playerWatcher } = Index

let wss

module.exports.setupWS = function(server) {
  let wsConnections = []
  let wss = new ws.Server({ server })

  function broadcast(data) {
    wsConnections.forEach(sconn => {
      sconn.send(JSON.stringify(data))
    })
  }

  wss.on('connection', async (conn, req) => {
    wsConnections.push(conn)
    conn.on('close', () => {
      wsConnections.splice(wsConnections.indexOf(conn), 1)
    })
  })

  logWatcher.on('newline', line => {
    broadcast({
      type: 'log-newline',
      line
    })
  })

  logWatcher.on('truncated', line => {
    broadcast({
      type: 'log-reset'
    })
  })

  playerWatcher.on('player-joined', player => broadcast({ type: 'player-joined', player }))
  playerWatcher.on('player-left', player => broadcast({ type: 'player-left', player }))

}
