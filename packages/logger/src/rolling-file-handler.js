const path = require('path')
const fs = require('fs')
const os = require('os')

function makeRollingFileLogger({
  dirname = os.tmpdir(),
  name = 'rolling-log',
  maxFileLength = 52428800 /* 50 MB */,
  maxFileNumber = 4,
}) {
  let writer = null
  let fileLength = 0
  let logFiles = findLogFiles({dirname, name})

  return {log, open, close}

  function open() {
    const filepath = path.resolve(dirname, `${name}-${new Date().toISOString().replace(/[-T:.]/g, '_')}.log`)
    ensureDirectoryExistence(filepath)
    writer = fs.createWriteStream(filepath, {flags: 'a', encoding: 'utf8'})
    fileLength = 0
    logFiles.push(filepath)
    if (logFiles.length > maxFileNumber) {
      try {
        fs.rmSync(logFiles.shift(), {maxRetries: 3, retryDelay: 300})
      } catch (err) {}
    }
  }
  function close() {
    if (!writer) return
    writer.end()
    writer = null
  }
  function log(message) {
    if (!writer) open()
    message += os.EOL
    const messageLength = Buffer.byteLength(message, 'utf8')
    if (fileLength + messageLength > maxFileLength) close(), open()
    writer.write(message)
    fileLength += messageLength
  }
}

function findLogFiles({dirname, name}) {
  if (!fs.existsSync(dirname)) return []
  const filenames = fs.readdirSync(dirname)
  const filenamePattern = new RegExp(`^${name}-\\d{4}_\\d{2}_\\d{2}_\\d{2}_\\d{2}_\\d{2}\\_\\d{3}Z\\.log$`)
  return filenames
    .filter(filename => filenamePattern.test(filename), 0)
    .sort()
    .map(filename => path.resolve(dirname, filename))
}

function ensureDirectoryExistence(filename) {
  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
  }
}

module.exports = makeRollingFileLogger
