import browser from 'webextension-polyfill'
import * as path from 'path'

export async function readFile(filePath, _options, callback) {
  const directory = filePath.includes('dom-snapshot') ? 'dom-snapshot' : 'dom-capture'
  const fileUrl = browser.runtime.getURL(`assets/${directory}/${path.basename(filePath)}`)
  try {
    const response = await fetch(fileUrl)
    const data = await response.text()
    callback(null, data)
    return data
  } catch (err) {
    callback(err)
    throw err
  }
}

export async function writeFile() {
  return null
}
