const config = require('./config.json')
const Tail = require('always-tail')

let logTail = new Tail(config.logfile, '\n', {
  interval: 100,
  start: 0
})

logTail.on('line', line => {
  console.log(line)
})

logTail.watch()
