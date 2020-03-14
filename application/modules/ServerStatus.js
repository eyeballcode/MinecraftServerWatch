const net = require('net')
const {jspack} = require('../../jspack')
const utf8 = require('utf8')

module.exports = class ServerStatus {

  constructor(address, port, timeout=5000) {
    this.address = address
    this.port = port
    this.timeout = timeout
    this.client
    this.stats = {}
  }

  packVarint(data) {
    let buffer = Buffer.from([])
    while (true) {
      let byte = data & 0x7F
      data >>= 7
      let b = byte | (data > 0 ? 0x80 : 0)
      buffer = Buffer.concat([buffer, Buffer.from([b])])

      if (data === 0) break
    }

    return buffer
  }

  pack(data) {
    if (typeof data === 'string') {
      return Buffer.concat([this.packVarint(data.length), Buffer.from(utf8.encode(data))])
    }
    if (typeof data === 'number') {
      let stuff
      if (Number.isInteger(data)) {
        stuff = jspack.Pack('H', [data])
      } else {
        stuff = jspack.Pack('L', [data])
      }
      return Buffer.from(stuff.reverse())
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client = net.connect(this.port, this.address, () => {
        let buff = Buffer.concat([
          Buffer.from([0x00, 0x00]),
          this.pack(this.address),
          this.pack(this.port),
          Buffer.from([0x01])
        ])
        let buff2 = Buffer.from([0x00])
        this.client.write(Buffer.concat([this.packVarint(buff.length), buff]))
        this.client.write(Buffer.concat([this.packVarint(buff2.length), buff2]))
      })

      this.client.setTimeout(this.timeout)

      let completeData = []

      this.client.on('data', data => {
        completeData.push(data)
        try {
          let fullPacket = completeData.join('').slice(5)
          let json = JSON.parse(fullPacket)
          this.stats = {
            version: json.version,
            motd: json.description.text.replace(/§\w/g, '')
          }
          this.client.end()
          resolve()
        } catch (e) {
        }
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

}
