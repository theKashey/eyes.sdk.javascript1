'use strict'
const cwd = process.cwd()
const path = require('path')
const {getEyes} = require('../../src/test-setup')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const fs = require('fs')
const {promisify} = require('util')
const ncp = require('ncp')
const pncp = promisify(ncp)

describe.skip('Coverage tests', () => {
  let driver, destroyDriver, eyes

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    eyes = await getEyes({stitchMode: 'CSS'})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('resilient to duplicate copies of the SDK', async () => {
    const {sdkPath, cleanup} = await createCopyOfSdk(cwd, 'dist')

    await spec.visit(driver, 'https://applitools.github.io/demo/TestPages/FramesTestPage/')

    module.constructor._pathCache = {}

    try {
      const sdk = require(sdkPath)

      await eyes.open(driver, 'Eyes JS SDK', 'duplicate copies of SDK', {width: 700, height: 460})
      await eyes.check(sdk.Target.region('#overflowing-div').fully())
      await eyes.close()
    } finally {
      cleanup()
    }
  })
})

async function createCopyOfSdk(pathToExistingSdk) {
  const targetCorePath = path.resolve(pathToExistingSdk, 'eyes-sdk-core')
  fs.rmdirSync(targetCorePath, {recursive: true})
  // copy core into here
  await pncp(
    path.resolve(pathToExistingSdk, 'node_modules', '@applitools', 'eyes-sdk-core'),
    targetCorePath,
  )

  // create copy of src folder
  const targetDistPath = path.resolve(pathToExistingSdk, 'dist2')
  fs.rmdirSync(targetDistPath, {recursive: true})
  await pncp(path.resolve(pathToExistingSdk, 'dist'), targetDistPath)

  // fix references in src folder
  fixReferencesInFolder(targetDistPath)

  return {sdkPath: targetDistPath, cleanup}

  function cleanup() {
    fs.rmdirSync(targetDistPath, {recursive: true})
    fs.rmdirSync(targetCorePath, {recursive: true})
  }
}

function fixReferencesInFolder(folderPath, depth = 2) {
  const filesInSrc = fs.readdirSync(folderPath)
  for (const file of filesInSrc) {
    const filepath = path.resolve(folderPath, file)
    if (fs.statSync(filepath).isDirectory()) {
      fixReferencesInFolder(filepath, depth + 1)
    } else {
      const content = fs.readFileSync(filepath).toString()
      const newContent = content.replace(
        '@applitools/eyes-sdk-core',
        `${new Array(depth).fill('../').join('')}eyes-sdk-core`,
      )
      fs.writeFileSync(filepath, newContent)
    }
  }
}
