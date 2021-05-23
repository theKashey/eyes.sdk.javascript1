'use strict'
const cwd = process.cwd()
const path = require('path')
const {setupEyes} = require('@applitools/test-utils')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {Target} = require(cwd)

describe('app viewport (@native @mobile @android)', function() {
  let driver, destroyDriver, eyes
  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      device: 'Samsung Galaxy S8',
      app: 'https://applitools.bintray.com/Examples/eyes-android-hello-world.apk',
    })
    eyes = new setupEyes()
  })

  afterEach(async () => {
    await destroyDriver()
    await eyes.abortIfNotClosed()
  })

  it('should capture the app without the system status/navigation bars', async () => {
    await eyes.open(
      driver,
      'Mobile Native Tests',
      'should capture the app without the system status/navigation bars',
    )
    await eyes.check('check', Target.window())
    await eyes.close(true)
  })
})
