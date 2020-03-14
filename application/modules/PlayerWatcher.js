const EventEmitter = require('events')

module.exports = class LogWatcher extends EventEmitter {

  constructor(logWatcher) {
    super()
    this.players = []

    logWatcher.on('newline', line => {
      if (line.thread === 'Server thread' && line.level === 'INFO') {
        let parts
        if (parts = line.message.match(/^(.*) joined the game$/)) {
          this.players.push(parts[1])
          this.emit('player-joined', parts[1])
        }
        if (parts = line.message.match(/^(.*) left the game$/)) {
          this.players.splice(this.players.indexOf(parts[1]), 1)
          this.emit('player-left', parts[1])
        }
      }
    })

    logWatcher.on('truncated', line => {
      this.players = []
    })
  }

  getPlayers() {
    return this.players
  }

}
