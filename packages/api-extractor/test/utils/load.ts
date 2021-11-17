import * as path from 'path'
import * as fs from 'fs'

export function load(fileName: string) {
  return fs.readFileSync(path.resolve('./test/fixtures', fileName), 'utf8')
}
