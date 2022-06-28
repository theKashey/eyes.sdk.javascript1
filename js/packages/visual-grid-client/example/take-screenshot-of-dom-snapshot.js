'use strict'

const {takeScreenshot} = require('..')
const fetch = require('node-fetch')
const path = require('path')
const fs = require('fs')
const transformImageLocation = require('./transform-image-location')

async function main() {
  let domSnapshot
  try {
    const folder = path.resolve(process.cwd(), process.argv[2])
    const domSnapshotBuffer = fs.readFileSync(folder)
    domSnapshot = JSON.parse(domSnapshotBuffer)
    console.log(
      `finished reading dom snapshot (${domSnapshotBuffer.byteLength} bytes) from`,
      folder,
    )
  } catch (ex) {
    console.log(ex)
    return
  }

  const serverUrl = 'https://eyesapi.applitools.com'
  const apiKey = process.env.APPLITOOLS_API_KEY
  const renderInfo = await fetch(`${serverUrl}/api/sessions/renderInfo?apiKey=${apiKey}`).then(r =>
    r.json(),
  )
  const [{imageLocation, renderId}] = await takeScreenshot({
    showLogs: !!process.env.APPLITOOLS_SHOW_LOGS,
    apiKey,
    renderInfo,
    ...domSnapshot,
  })

  console.log('render ID:', renderId)
  console.log('image location:', transformImageLocation(imageLocation, serverUrl))
}

main().catch(ex => {
  console.log(ex)
  process.exit(1)
})
