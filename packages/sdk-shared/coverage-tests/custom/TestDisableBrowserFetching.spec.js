'use strict'

const path = require('path')
const cwd = process.cwd()
const {testServer} = require('@applitools/test-server')
const {Target} = require(cwd)
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {setupEyes} = require('@applitools/test-utils')
const adjustUrlToDocker = require('../util/adjust-url-to-docker')

describe('TestDisableBrowserFetching', () => {
  let server
  let driver, destroyDriver

  before(async () => {
    const staticPath = path.join(__dirname, '../fixtures')
    server = await testServer({
      port: 5559,
      staticPath,
      middlewares: ['ua'],
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

  it('sends dontFetchResources to dom snapshot', async () => {
    const url = adjustUrlToDocker('http://localhost:5559/ua.html')
    await spec.visit(driver, url)
    const eyes = setupEyes({vg: true, disableBrowserFetching: true})
    await eyes.open(driver, 'VgFetch', 'TestDisableBrowserFetching', {width: 800, height: 600})
    await eyes.check(Target.window())
    await eyes.close()
  })
})
