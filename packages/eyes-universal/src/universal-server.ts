import type * as types from '@applitools/types'
import type {Socket} from './socket'
import type {Driver, Context, Element, Selector} from './spec-driver'
import {makeSDK} from '@applitools/eyes-sdk-core'
import {makeSpec, webdriverSpec} from './spec-driver'
import {makeHandler} from './handler'
import {makeSocket} from './socket'
import {makeRefer} from './refer'
import {makeTracker} from './debug/tracker'
import {checkSpecDriver} from './debug/spec-driver'

const IDLE_TIMEOUT = 900000 // 15min

export async function makeServer({debug = false, idleTimeout = IDLE_TIMEOUT, ...serverConfig} = {}) {
  const {server, port} = await makeHandler(serverConfig)
  console.log(port) // NOTE: this is a part of the protocol
  if (!server) {
    console.log(`You are trying to spawn a duplicated server, use the server on port ${port} instead`)
    return null
  }
  let idle = setTimeout(() => server.close(), idleTimeout)

  server.on('connection', client => {
    const tracker = makeTracker({track: debug})
    const refer = makeRefer()
    const socket = makeSocket(client) as Socket & types.ServerSocket<Driver, Context, Element, Selector>

    clearTimeout(idle)
    socket.on('close', () => {
      if (server.clients.size > 0) return
      idle = setTimeout(() => server.close(), idleTimeout)
    })

    const init = new Promise<types.Core<Driver, Element, Selector>>(resolve => {
      socket.once('Session.init', ({name, version, commands, protocol}) => {
        const sdk = makeSDK<Driver, Context, Element, Selector>({
          name: `eyes-universal/${name}`,
          version: `${require('../package.json').version}/${version}`,
          spec: protocol === 'webdriver' ? webdriverSpec : makeSpec({socket, commands}),
          VisualGridClient: require('@applitools/visual-grid-client'),
        })
        resolve(sdk)
      })
    })

    socket.command('Core.makeManager', async config => {
      const sdk = await init
      const manager = await sdk.makeManager(config)
      const managerRef = refer.ref(manager)
      tracker.makeManager(config, managerRef)
      return managerRef
    })
    socket.command('Core.getViewportSize', async ({driver}) => {
      const sdk = await init
      return sdk.getViewportSize({driver})
    })
    socket.command('Core.setViewportSize', async ({driver, size}) => {
      const sdk = await init
      return sdk.setViewportSize({driver, size})
    })
    socket.command('Core.closeBatches', async settings => {
      const sdk = await init
      return sdk.closeBatches(settings)
    })
    socket.command('Core.deleteTest', async settings => {
      const sdk = await init
      return sdk.deleteTest(settings)
    })

    socket.command('EyesManager.makeEyes', async ({manager, driver, config}) => {
      const eyes = await refer.deref(manager).makeEyes({driver, config})
      const eyesRef = refer.ref(eyes, manager)
      tracker.makeEyes({manager, driver, config}, eyesRef)
      return eyesRef
    })
    socket.command('EyesManager.closeAllEyes', async ({manager}) => {
      return refer.deref(manager).closeAllEyes()
    })

    socket.command('Eyes.check', async ({eyes, settings, config}) => {
      const result = await refer.deref(eyes).check({settings, config})
      tracker.check({eyes, settings, config}, result)
      return result
    })
    socket.command('Eyes.locate', async ({eyes, settings, config}) => {
      const result = refer.deref(eyes).locate({settings, config})
      tracker.locate({eyes, settings, config}, result)
      return result
    })
    socket.command('Eyes.extractTextRegions', async ({eyes, settings, config}) => {
      const result = await refer.deref(eyes).extractTextRegions({settings, config})
      tracker.extractTextRegions({eyes, settings, config}, result)
      return result
    })
    socket.command('Eyes.extractText', async ({eyes, regions, config}) => {
      const result = await refer.deref(eyes).extractText({regions, config})
      tracker.extractText({eyes, regions, config}, result)
      return result
    })
    socket.command('Eyes.close', async ({eyes}) => {
      const result = await refer.deref(eyes).close()
      refer.destroy(eyes)
      tracker.close({eyes}, result)
      return result
    })
    socket.command('Eyes.abort', async ({eyes}) => {
      const result = await refer.deref(eyes).abort()
      refer.destroy(eyes)
      tracker.abort({eyes}, result)
      return result
    })

    socket.command('Debug.checkSpecDriver', async ({driver, commands}) => {
      return checkSpecDriver({spec: makeSpec({socket, commands}), driver})
    })

    socket.command('Debug.getHistory', async () => {
      return tracker.toJSON()
    })
  })

  return {port, close: () => server.close()}
}
