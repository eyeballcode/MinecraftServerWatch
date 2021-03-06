const https = require('https')
const tls = require('tls')
const fs = require('fs')
const path = require('path')
const config = require('../config.json')

let secureContext = null

module.exports = {

  createSecureContext: certPath => {
    const sslCertPath = path.join(certPath, 'fullchain.pem')
    const sslKeyPath = path.join(certPath, 'privkey.pem')
    const caPath = path.join(certPath, 'chain.pem')

    const context = tls.createSecureContext({
      cert: fs.readFileSync(sslCertPath),
      key: fs.readFileSync(sslKeyPath),
      ca: fs.readFileSync(caPath),
      minVersion: 'TLSv1.2'
    })

    secureContext = context
  },

  getSecureContext: () => {
    return secureContext
  },

  createSNICallback: () => {
    return (servername, callback) => {
      callback(null, module.exports.getSecureContext())
    }
  },

  createServer: (app, certPath) => {
    module.exports.createSecureContext(certPath)

    return https.createServer({
      SNICallback: module.exports.createSNICallback()
    }, app.app)
    // return spdy.createServer({
    //   SNICallback: module.exports.createSNICallback(),
    //   spdy: {
    //     protocols: [ 'h2', 'spdy/3.1', 'http/1.1' ]
    //   }
    // }, app.app)
  }

}

if (config.useLetsEncrypt) { require('../security/LetsEncryptCertificateRenewal') }
