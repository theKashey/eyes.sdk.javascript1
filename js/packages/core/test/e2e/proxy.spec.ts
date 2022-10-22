import * as spec from '@applitools/spec-driver-webdriverio'
import {makeCore} from '../../src/index'
import {makeProxyServer} from '../utils/proxy-server'
// import assert from 'assert'

// 1. This test isn't reliable at the moment because it will pass even if we remove the proxy.
// 2. The idea is to add some interception mechanism to the proxy server, and collect all of the
//    requests that pass through the proxy to process it latter and find out if all of the communication went through the proxy
// 3. To test that we use proxy to get the resources of the page we should serve our own page on the localhost and add a middleware
//    that will not serve the resource without a special header, that will be added only by the proxy middleware
describe('proxy', () => {
  let driver, destroyDriver, proxy

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  beforeEach(async () => {
    proxy = await makeProxyServer({})
  })

  afterEach(async () => {
    await proxy?.close()
  })

  it('ufg eyes works with proxy', async () => {
    await driver.url('https://applitools.com/helloworld')

    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'ufg', concurrency: 5})
    const eyes = await manager.openEyes({
      target: driver,
      settings: {
        appName: 'js core',
        testName: `ufg works with proxy`,
        proxy: {url: `http://localhost:${proxy.port}`},
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })

    await eyes.check({settings: {fully: false}})

    await eyes.close({settings: {throwErr: true, updateBaselineIfNew: false}})
  })

  it('classic eyes works with proxy', async () => {
    await driver.url('https://applitools.com/helloworld')

    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'classic'})
    const eyes = await manager.openEyes({
      target: driver,
      settings: {
        appName: 'js core',
        testName: `classic works with proxy`,
        proxy: {url: `http://localhost:${proxy.port}`},
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })

    await eyes.check({settings: {fully: false}})

    await eyes.close({settings: {throwErr: true, updateBaselineIfNew: false}})
  })
})
