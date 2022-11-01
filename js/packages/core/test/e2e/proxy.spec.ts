import {makeCore} from '../../src/index'
import {makeProxyServer, restrictNetwork} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-webdriverio'
import * as utils from '@applitools/utils'

describe('proxy', () => {
  let driver, destroyDriver, proxy, restoreNetwork

  describe('images with proxy', () => {
    before(async () => {
      restoreNetwork = restrictNetwork(options => {
        return (
          !utils.types.has(options, 'port') ||
          !options.host ||
          options.host === 'localhost' ||
          (options as any).headers?.['x-proxy-agent'] === 'TestProxy'
        )
      })
      proxy = await makeProxyServer()
    })

    after(async () => {
      await proxy?.close()
      await restoreNetwork?.()
    })

    it('classic works with proxy', async () => {
      const core = makeCore()
      const manager = await core.makeManager({type: 'classic'})
      const eyes = await manager.openEyes({
        settings: {
          appName: 'js core',
          testName: `images works with proxy`,
          proxy: {url: `http://localhost:${proxy.port}`},
          environment: {viewportSize: {width: 800, height: 600}},
        },
      })

      await eyes.check({target: {image: 'https://picsum.photos/500'}})

      await eyes.close({settings: {throwErr: false, updateBaselineIfNew: false}})
    })
  })

  describe('web with proxy', () => {
    before(async () => {
      restoreNetwork = restrictNetwork(options => {
        return (
          !utils.types.has(options, 'port') ||
          !options.host ||
          options.host === 'localhost' ||
          (options as any).headers?.['x-proxy-agent'] === 'TestProxy'
        )
      })
      proxy = await makeProxyServer()
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    })

    after(async () => {
      await destroyDriver?.()
      await proxy?.close()
      await restoreNetwork?.()
    })

    it('ufg works with proxy', async () => {
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

    it('classic works with proxy', async () => {
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

  describe('web with aut proxy', () => {
    before(async () => {
      restoreNetwork = restrictNetwork(options => {
        const headers = (options as any).headers
        const accept = headers?.['Accept'] ?? headers?.['accept']
        const acceptString = utils.types.isArray(accept) ? accept.join(', ') : accept
        return (
          !utils.types.has(options, 'port') ||
          !options.host ||
          options.host === 'localhost' ||
          acceptString === 'application/json' ||
          headers?.['x-proxy-agent'] === 'TestProxy'
        )
      })
      proxy = await makeProxyServer()
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    })

    after(async () => {
      await destroyDriver?.()
      await proxy?.close()
      await restoreNetwork?.()
    })

    it('ufg works with aut proxy', async () => {
      await driver.url('https://applitools.com/helloworld')

      const core = makeCore({spec})
      const manager = await core.makeManager({type: 'ufg', concurrency: 5})
      const eyes = await manager.openEyes({
        target: driver,
        settings: {
          appName: 'js core',
          testName: `ufg works with proxy`,
          environment: {viewportSize: {width: 800, height: 600}},
        },
      })

      await eyes.check({
        settings: {
          autProxy: {url: `http://localhost:${proxy.port}`},
          fully: false,
        },
      })

      await eyes.close({settings: {throwErr: true, updateBaselineIfNew: false}})
    })
  })

  describe('native with proxy', () => {
    before(async () => {
      restoreNetwork = restrictNetwork(options => {
        return (
          !utils.types.has(options, 'port') ||
          !options.host ||
          options.host === 'localhost' ||
          options.host === 'ondemand.us-west-1.saucelabs.com' ||
          (options as any).headers?.['x-proxy-agent'] === 'TestProxy'
        )
      })
      proxy = await makeProxyServer()
      ;[driver, destroyDriver] = await spec.build({
        device: 'iPhone 12',
        app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp-instrumented-nml-nmg-flat-caps.zip',
        injectUFGLib: true,
        withNML: true,
      })
    })

    after(async () => {
      await destroyDriver?.()
      await proxy?.close()
      await restoreNetwork?.()
    })

    it('ufg works with nml and proxy', async () => {
      const core = makeCore({spec})
      const manager = await core.makeManager({type: 'ufg', concurrency: 5})
      const eyes = await manager.openEyes({
        target: driver,
        settings: {
          serverUrl: 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY,
          proxy: {url: `http://localhost:${proxy.port}`},
          appName: 'core app',
          testName: 'native ufg ios nml',
        },
      })
      await eyes.check({
        settings: {
          waitBeforeCapture: 1500,
          renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12', version: 'latest-1'}}],
        },
      })
      await eyes.close({settings: {throwErr: true, updateBaselineIfNew: false}})
    })
  })
})
