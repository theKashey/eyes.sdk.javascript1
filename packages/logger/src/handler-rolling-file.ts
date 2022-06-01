import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import {type Handler} from './handler'

export type RollingFileHandler = {
  type: 'rolling file'
  dirname?: string
  name?: string
  maxFileLength?: number
  maxFileNumber?: number
}

export function makeRollingFileHandler({
  dirname = process.env.APPLITOOLS_LOG_DIR ?? os.tmpdir(),
  name = 'rolling-log',
  maxFileLength = 52428800 /* 50 MB */,
  maxFileNumber = 4,
}: Omit<RollingFileHandler, 'type'> = {}): Handler {
  let writer: fs.WriteStream = null
  let fileLength = 0
  const logFiles = findLogFiles({dirname, name})

  return {log, open, close}

  function open() {
    const filepath = path.resolve(dirname, `${name}-${new Date().toISOString().replace(/[-T:.]/g, '_')}.log`)
    ensureDirectoryExistence(filepath)
    writer = fs.createWriteStream(filepath, {flags: 'a', encoding: 'utf8'})
    fileLength = 0
    logFiles.push(filepath)
    if (logFiles.length > maxFileNumber) {
      try {
        // @ts-ignore - fs.rmSync is not available in node <= 14.14
        fs.rmSync(logFiles.shift(), {maxRetries: 3, retryDelay: 300})
      } catch (err) {}
    }
  }
  function close() {
    if (!writer) return
    writer.end()
    writer = null
  }
  function log(message: string) {
    if (!writer) open()
    message += os.EOL
    const messageLength = Buffer.byteLength(message, 'utf8')
    if (fileLength + messageLength > maxFileLength) close(), open()
    writer.write(message)
    fileLength += messageLength
  }
}

function findLogFiles({dirname, name}: {dirname: string; name: string}): string[] {
  if (!fs.existsSync(dirname)) return []
  const filenames = fs.readdirSync(dirname)
  const filenamePattern = new RegExp(`^${name}-\\d{4}_\\d{2}_\\d{2}_\\d{2}_\\d{2}_\\d{2}\\_\\d{3}Z\\.log$`)
  return filenames
    .filter(filename => filenamePattern.test(filename), 0)
    .sort()
    .map(filename => path.resolve(dirname, filename))
}

function ensureDirectoryExistence(filename: string) {
  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
  }
}
