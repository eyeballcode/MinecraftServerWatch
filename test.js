// const config = require('./config.json')
// const Tail = require('always-tail')
//
// let logTail = new Tail(config.logfile, '\n', {
//   interval: 100,
//   start: 0
// })
//
// logTail.on('line', line => {
//   console.log(line)
// })
//
// logTail.watch()

let ServerStatus = require('./application/modules/ServerStatus')

async function m() {
  let s = new ServerStatus('jmss-mc.transportsg.me', 25565, 5000)
  await s.connect()

  console.log(s.getMOTD())
}

m()
