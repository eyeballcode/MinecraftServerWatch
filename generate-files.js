const fs = require('fs')
const path = require('path')
const async = require('async')
const crypto = require('crypto')

function walk(dir, done) {
  let results = []
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    let i = 0
    function next() {
      let file = list[i++]
      if (!file) return done(null, results)
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res)
            next()
          })
        } else {
          results.push(file)
          next()
        }
      })
    }
    next()
  })
}

function walkDir(dir, done) {
  let results = []
  fs.readdir(dir, function(err, list) {
    if (err) return done(err)
    let i = 0
    function next() {
      let file = list[i++]
      if (!file) return done(null, results)
      file = path.resolve(dir, file)
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          results.push(file)
          walkDir(file, function(err, res) {
            results = results.concat(res)
            next()
          })
        } else next()
      })
    }
    next()
  })
}

function hashFile(path) {
  return new Promise(resolve => {
    let fd = fs.createReadStream(path)
    let hash = crypto.createHash('sha512')
    hash.setEncoding('hex')

    fd.on('end', function() {
      hash.end()
      resolve(hash.read())
    });

    fd.pipe(hash)
  })
}

let filesBase = path.join(__dirname, 'files')

walk(filesBase, async (err, results) => {
  let files = (await async.map(results, async file => {
    if (file.includes('files.json')) return null
    if (file.includes('folders.json')) return null

    let hash = await hashFile(file)
    let relativePath = file.replace(filesBase, '').slice(1)

    let parts = relativePath.split('/')
    let type = parts.shift()

    return {
      type,
      path: parts.join('/'),
      hash
    }
  })).filter(Boolean)

  fs.writeFileSync(path.join(filesBase, 'files.json'), JSON.stringify(files))
})

walkDir(filesBase, (err, results) => {
  let folders = results.map(file => file.replace(filesBase, '').slice(1))
  fs.writeFileSync(path.join(filesBase, 'folders.json'), JSON.stringify(folders))
})
