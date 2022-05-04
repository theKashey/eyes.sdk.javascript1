import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import {type Handler} from './handler'

export type FileHandler = {
  type: 'file'
  filename?: string
  append?: boolean
}

export function makeFileHandler({filename = 'eyes.log', append = true}: Omit<FileHandler, 'type'> = {}): Handler {
  let writer: fs.WriteStream = null

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
  function log(message: string) {
    if (!writer) open()
    writer.write(message + os.EOL)
  }
}

function ensureDirectoryExistence(filename: string) {
  const dirname = path.dirname(filename)
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
  }
}
