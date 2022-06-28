'use strict'

const path = require('path')
const cwd = process.cwd()
const {testServer} = require('@applitools/test-server')
const {Target} = require(cwd)
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {setupEyes} = require('@applitools/test-utils')
const adjustUrlToDocker = require('../util/adjust-url-to-docker')

describe('DOMSnapshotSkipList', () => {
  let server
  let driver, destroyDriver

  before(async () => {
    const staticPath = path.join(__dirname, '../fixtures')
    server = await testServer({
      port: 5558,
      staticPath,
      middlewares: ['ephemeral'],
    })
  })

  after(async () => {
    await server.close()
  })

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('skip list for DOM snapshot works with dependencies for blobs', async () => {
    const url = adjustUrlToDocker('http://localhost:5558/skip-list/skip-list.html')
    await spec.visit(driver, url)
    const eyes = setupEyes({vg: true})
    await eyes.open(driver, 'Applitools Eyes SDK', 'DOMSnapshotSkipList', {width: 800, height: 600})
    await eyes.check(Target.window().fully())
    await spec.visit(driver, url)
    await eyes.check(Target.window().fully())
    await eyes.close()
  })
})
