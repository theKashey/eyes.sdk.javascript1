import {readFileSync} from 'fs'
import {makeCore, type Core} from '../../src/index'
import assert from 'assert'

describe('images', () => {
  let core: Core

  before(() => {
    core = makeCore({agentId: 'core-base/test'})
  })

  it('works with png image input', async () => {
    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        appName: 'Test App',
        testName: 'Test',
        environment: {
          os: 'Platform',
          hostingApp: 'TestBrowser',
          deviceName: 'Machine',
          viewportSize: {width: 210, height: 700},
        },
      },
    })

    await eyes.check({
      target: {
        image: readFileSync('./test/fixtures/screenshot.png'),
      },
    })

    const [result] = await eyes.close()
    assert.strictEqual(result.status, 'Passed')
  })

  it('works with jpeg image input', async () => {
    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        appName: 'Test App',
        testName: 'Test',
        environment: {
          os: 'Platform',
          hostingApp: 'TestBrowser',
          deviceName: 'Machine',
          viewportSize: {width: 210, height: 700},
        },
      },
    })

    await eyes.check({
      target: {
        image: readFileSync('./test/fixtures/screenshot.jpeg'),
      },
    })

    const [result] = await eyes.close()
    assert.strictEqual(result.status, 'Passed')
  })
})
