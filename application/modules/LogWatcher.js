const Tail = require('../../tail')
// const Tail = require('always-tail')
const EventEmitter = require('events')

module.exports = class LogWatcher extends EventEmitter {
  constructor(path) {
    super()
    this.fullLog = []
    this.logTail = new Tail(path, '\n', {
      interval: 100,
      start: 0
    })

    this.logTail.on('line', line => {
      line = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim()
      line = line.replace(/^> \r/, '') // backspace

      let lineParts = line.match(/^\[(.*?)\] \[(.*?)\/(.*?)\] \[(.*?)\]: (.+)/)
      let match, time, thread, level, mod, message

      if (lineParts) {
        [match, time, thread, level, mod, message] = lineParts
      } else {
        lineParts = line.match(/^\[(.*?)\] \[(.*?)\/(.*?)\]: (.+)/)
        if (lineParts)
          [match, time, thread, level, message] = lineParts
        else {
          time = ''
          thread = ''
          level = 'INFO'
          mod = ''
          message = line
        }
      }

      let data = {
        time, thread, level, mod, message
      }

      this.emit('newline', data)
      this.fullLog.push(data)
    })

    this.logTail.on('truncated', () => {
      this.emit('truncated')
    })

    this.logTail.watch()
  }

  getFullLog() {
    return this.fullLog
  }
}
