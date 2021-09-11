import type * as types from '@applitools/types'
import type {Socket} from './socket'
import type {Driver, Context, Element, Selector} from './spec-driver'
import {makeSDK, checkSpecDriver} from '@applitools/eyes-sdk-core'
import {makeSpec, webdriverSpec} from './spec-driver'
import {makeHandler} from './handler'
import {makeSocket} from './socket'
import {makeRefer} from './refer'
import {withTracker} from './debug/tracker'

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
    const refer = makeRefer()
    const socket = withTracker({
      debug,
      socket: makeSocket(client) as Socket & types.ServerSocket<Driver, Context, Element, Selector>,
    })

    clearTimeout(idle)
    socket.on('close', () => {
      if (server.clients.size > 0) return
      idle = setTimeout(() => server.close(), idleTimeout)
    })

    const sdkPromise = socket.create('Core.makeSDK', ({name, version, commands, protocol}) => {
      return makeSDK<Driver, Context, Element, Selector>({
        name: `eyes-universal/${name}`,
        version: `${require('../package.json').version}/${version}`,
        spec: protocol === 'webdriver' ? webdriverSpec : makeSpec({socket, commands}),
        VisualGridClient: require('@applitools/visual-grid-client'),
      })
    })

    socket.command('Core.makeManager', async config => {
      const sdk = await sdkPromise
      const managerRef = refer.ref(await sdk.makeManager(config))
      return managerRef
    })
    socket.command('Core.getViewportSize', async ({driver}) => {
      const sdk = await sdkPromise
      return sdk.getViewportSize({driver})
    })
    socket.command('Core.setViewportSize', async ({driver, size}) => {
      const sdk = await sdkPromise
      return sdk.setViewportSize({driver, size})
    })
    socket.command('Core.closeBatches', async settings => {
      const sdk = await sdkPromise
      return sdk.closeBatches(settings)
    })
    socket.command('Core.deleteTest', async settings => {
      const sdk = await sdkPromise
      return sdk.deleteTest(settings)
    })

    socket.command('EyesManager.openEyes', async ({manager, driver, config}) => {
      const eyes = await refer.deref(manager).openEyes({driver, config})
      const eyesRef = refer.ref(eyes, manager)
      return eyesRef
    })
    socket.command('EyesManager.closeAllEyes', async ({manager, throwErr}) => {
      return refer.deref(manager).closeAllEyes({throwErr})
    })

    socket.command('Eyes.check', async ({eyes, settings, config}) => {
      return refer.deref(eyes).check({settings, config})
    })
    socket.command('Eyes.locate', async ({eyes, settings, config}) => {
      return refer.deref(eyes).locate({settings, config})
    })
    socket.command('Eyes.extractTextRegions', async ({eyes, settings, config}) => {
      return refer.deref(eyes).extractTextRegions({settings, config})
    })
    socket.command('Eyes.extractText', async ({eyes, regions, config}) => {
      return refer.deref(eyes).extractText({regions, config})
    })
    socket.command('Eyes.close', async ({eyes, throwErr}) => {
      const results = await refer.deref(eyes).close({throwErr})
      refer.destroy(eyes)
      return results
    })
    socket.command('Eyes.abort', async ({eyes}) => {
      const results = await refer.deref(eyes).abort()
      refer.destroy(eyes)
      return results
    })

    socket.command('Debug.checkSpecDriver', async ({driver, commands}) => {
      return checkSpecDriver({spec: makeSpec({socket, commands}), driver})
    })

    socket.command('Debug.getHistory', async () => {
      return socket.getHistory()
    })
  })

  return {port, close: () => server.close()}
}
