const path = require('path')
const fs = require('fs')
const os = require('os')

function makeFileLogger({filename = 'eyes.log', append = true}) {
  let writer = null

  return {log, open, close}

  function open() {
    const filepath = path.normalize(filename)
    ensureDirectoryExistence(filepath)
    writer = fs.createWriteStream(filepath, {flags: append ? 'a' : 'w', encoding: 'utf8'})
  }
  function close() {
    if (!writer) return
    writer.end()
    writer = null
  }
  function log(message) {
    if (!writer) open()
    writer.write(message + os.EOL)
  }
}

function ensureDirectoryExistence(filename) {
  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
  }
}

module.exports = makeFileLogger
