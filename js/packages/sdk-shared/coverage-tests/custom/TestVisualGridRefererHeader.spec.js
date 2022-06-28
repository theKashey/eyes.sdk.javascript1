'use strict'

const path = require('path')
const cwd = process.cwd()
const {testServer} = require('@applitools/test-server')
const {Target} = require(cwd)
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {setupEyes} = require('@applitools/test-utils')
const adjustUrlToDocker = require('../util/adjust-url-to-docker')

describe('TestVisualGridRefererHeader', () => {
  let testServer1, testServer2
  let driver, destroyDriver

  before(async () => {
    const staticPath = path.join(__dirname, '../fixtures')
    testServer1 = await testServer({port: 5555, staticPath})
    testServer2 = await testServer({
      staticPath,
      port: 5556,
      allowCors: false,
      middlewares: ['cors'],
      allowedUrls: [adjustUrlToDocker('http://localhost:5555/cors.html')],
    })
  })

  after(async () => {
    // await new Promise(r => setTimeout(r, 30000))
    await Promise.all([testServer1.close(), testServer2.close()])
  })

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    await destroyDriver()
  })

  it('send referer header', async () => {
    const url = adjustUrlToDocker('http://localhost:5555/cors.html')
    await spec.visit(driver, url)
    const eyes = setupEyes({vg: true})
    await eyes.open(driver, 'VgFetch', ' VgFetch referer', {width: 800, height: 600})
    await eyes.check('referer', Target.window())
    await eyes.close()
  })
})
