const cwd = process.cwd()
const path = require('path')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {testServer} = require('@applitools/test-server')
const {setupEyes} = require('@applitools/test-utils')
const adjustUrlToDocker = require('../util/adjust-url-to-docker')

describe('Coverage Tests', () => {
  let driver, destroy, eyes, serverA, serverB, url

  beforeEach(async () => {
    url = adjustUrlToDocker('http://localhost:7373/cors_frames/cors.hbs')
    const staticPath = path.join(__dirname, '../fixtures')
    serverA = await testServer({
      port: 7373,
      staticPath,
      allowCors: false,
      middlewares: ['handlebars'],
      hbData: {
        src: adjustUrlToDocker('http://localhost:7374/cors_frames/frame.html'),
      },
    })
    serverB = await testServer({port: 7374, staticPath})
    ;[driver, destroy] = await spec.build({browser: 'chrome'})
    eyes = setupEyes({stitchMode: 'CSS'})
  })

  afterEach(async () => {
    try {
      await destroy()
    } finally {
      await serverA.close()
      await serverB.close()
    }
  })

  it('TestCheckDomSnapshotCrossOriginFrames_VG', async () => {
    await spec.visit(driver, url)
    await eyes.open(driver, 'CORS iframes', 'TestCheckDomSnapshotCrossOriginFrames_VG', {
      width: 1200,
      height: 800,
    })
    await eyes.check()
    await eyes.close(true)
  })
})
