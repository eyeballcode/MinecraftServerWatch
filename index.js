global.startTime = +new Date()

const config = require('./config.json')
const HTTPServer = require('./server/HTTPServer')
const HTTPSServer = require('./server/HTTPSServer')
const HTTPSRedirectServer = require('./server/HTTPSRedirectServer')
const MainServer = require('./server/MainServer')

global.config = config

let httpServer = null
let httpsServer = null
const mainServer = new MainServer()

if (config.useHTTPS) {
  const redirectServer = new HTTPSRedirectServer()
  httpServer = HTTPServer.createServer(redirectServer)

  httpsServer = HTTPSServer.createServer(mainServer, config.sslCertPath)
} else {
  httpServer = HTTPServer.createServer(mainServer)
}

require(`./application/routes/WebSocket`).setupWS(httpsServer || httpServer)

httpServer.listen(config.httpPort)
if (httpsServer) httpsServer.listen(443)

process.on('uncaughtException', (err) => {
  console.error(new Date() + '  ' + (err && err.stack) ? err.stack : err)
})

console.err = console.error
