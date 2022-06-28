'use strict'

const path = require('path')
const cwd = process.cwd()
const {setupEyes} = require('@applitools/test-utils')
const {testServer} = require('@applitools/test-server')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {Target} = require('../../dist')
let server, eyes

fixture`TestDisableBrowserFetching`
  .before(async () => {
    const staticPath = path.join(cwd, 'node_modules/@applitools/sdk-shared/coverage-tests/fixtures')
    server = await testServer({
      port: 5557,
      staticPath,
      middlewares: ['ua'],
    })
    eyes = setupEyes({vg: true, disableBrowserFetching: true})
  })
  .after(async () => {
    await server.close()
  })
test('sends dontFetchResources to dom snapshot', async driver => {
  await spec.visit(driver, 'http://localhost:5557/ua.html')
  await eyes.open({
    t: driver,
    appName: 'VgFetch',
    testName: 'TestDisableBrowserFetching',
    browser: [{width: 800, height: 600, name: 'chrome'}],
    disableBrowserFetching: true,
  })
  await eyes.check(Target.window())
  await eyes.close()
})
