import fs from 'fs'
import url from 'url'
import path from 'path'
import browser from 'webextension-polyfill'

fs.open = () => {}
url.URL = URL
process.hrtime = require('browser-process-hrtime')
fs.readFile = async (filePath, _options, callback) => {
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

fs.writeFile = async () => {
  return null
}
