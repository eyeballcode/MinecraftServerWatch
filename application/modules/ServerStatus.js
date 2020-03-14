const net = require('net')

module.exports = class ServerStatus {

  constructor(address, port, timeout=5000) {
    this.address = address
    this.port = port
    this.timeout = timeout
    this.client
    this.stats = {}
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = net.connect(this.port, this.address, () => {
        var buff = Buffer.from([0xFE, 0x01])
        this.client.write(buff)
      })

      this.client.setTimeout(this.timeout)

      this.client.on('data', data => {
        if(data) {
          let serverInfo = data.toString().split('\x00\x00\x00')
          if (serverInfo && serverInfo.length >= 6) {
            serverInfo = serverInfo.slice(2).map(e => e.replace(/\u0000/g,''))
            this.stats.online = true
            this.stats.version = serverInfo[0]
            this.stats.motd = serverInfo[1].replace(/§\w/g, '')
            this.stats.currentPlayers = serverInfo[2]
            this.stats.maxPlayers = serverInfo[3]
          } else {
            this.stats = { online: false }
          }
        }

        this.client.end()
        resolve()
      })

      this.client.on('timeout', () => {
        this.client.end()
        this.stats = { online: false }
        reject()
      })
    })
  }

  getVersion() {
    return this.stats.version
  }

  getMOTD() {
    return this.stats.motd
  }

  getCurrentPlayers() {
    return this.stats.currentPlayers
  }

  getMaxPlayers() {
    return this.stats.maxPlayers
  }

}
