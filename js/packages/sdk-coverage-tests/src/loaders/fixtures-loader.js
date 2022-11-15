const os = require('os')
const {promises: fs} = require('fs')
const zip = require('jszip')
const path = require('path')
const fetch = require('node-fetch')
const {isUrl} = require('../common-util')

async function fixturesLoader({fixtures: fixturesPath}) {
  if (!isUrl(fixturesPath)) return fixturesPath

  const localFixturePath = path.resolve(os.homedir(), '.applitools', 'fixtures')

  const buffer = await (await fetch(fixturesPath)).buffer()
  const content = await zip.loadAsync(buffer, {createFolders: true})

  await fs.mkdir(localFixturePath, {recursive: true})

  for (const [filename, info] of Object.entries(content.files)) {
    const fullPath = path.join(localFixturePath, filename)
    if (info.dir) await fs.mkdir(fullPath, {recursive: true})
    else await fs.writeFile(fullPath, await content.file(filename).async('nodebuffer'))
  }

  return localFixturePath
}

exports.fixturesLoader = fixturesLoader
