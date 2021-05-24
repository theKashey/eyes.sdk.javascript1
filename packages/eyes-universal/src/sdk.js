const {makeSDK} = require('@applitools/eyes-sdk-core')
const VisualGridClient = require('@applitools/visual-grid-client')
const makeServer = require('./server')
const makeSocket = require('./socket')
const makeSpec = require('./spec-driver')
const makeRefer = require('./refer')
const {version} = require('../package.json')

const IDLE_TIMEOUT = 900000 // 15min

async function makeAPI({idleTimeout = IDLE_TIMEOUT, ...serverConfig} = {}) {
  const {server, port} = await makeServer(serverConfig)
  console.log(port) // NOTE: this is a part of the protocol
  if (!server) {
    console.log(
      `You trying to spawn a duplicated server, please use server on port ${port} instead`,
    )
    return null
  }
  server.idle = setTimeout(() => server.close(), idleTimeout)

  server.on('connection', client => {
    clearTimeout(server.idle)
    const socket = makeSocket(client)
    const refer = makeRefer()

    socket.on('close', () => {
      if (server.clients.size === 0) {
        server.idle = setTimeout(() => server.close(), idleTimeout)
      }
    })

    socket.once('Session.init', config => {
      const commands = [
        'isDriver',
        'isElement',
        'isSelector',
        'extractSelector',
        'isStaleElementError',
        ...config.commands,
      ]
      const spec = makeSpec(socket, commands)

      socket.sdk = makeSDK({
        name: `eyes-universal/${config.name}`,
        version: `${version}/${config.version}`,
        spec,
        VisualGridClient,
      })
    })

    socket.command('EyesRunner.new', async ({config}) => {
      const eyes = socket.sdk.makeEyes(config)
      return refer.ref(eyes)
    })
    socket.command('EyesRunner.open', async ({eyes, driver, config}) => {
      const commands = await refer.deref(eyes).open(driver, config)
      return refer.ref(commands, eyes)
    })
    socket.command('EyesRunner.close', async ({eyes}) => {
      return await refer.deref(eyes).getResults()
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
    socket.command('Eyes.close', ({eyes}) => {
      const commands = refer.deref(eyes)
      refer.destroy(eyes)
      return commands.close()
    })
    socket.command('Eyes.abort', ({eyes}) => {
      const commands = refer.deref(eyes)
      refer.destroy(eyes)
      return commands.abort()
    })

    socket.command('Util.getViewportSize', async ({driver}) => {
      return socket.sdk.getViewportSize(driver)
    })
    socket.command('Util.setViewportSize', async ({driver, viewportSize}) => {
      return socket.sdk.setViewportSize(driver, viewportSize)
    })
    socket.command('Util.closeBatches', config => {
      return socket.sdk.closeBatch(config)
    })
    socket.command('Util.deleteTestResults', config => {
      return socket.sdk.deleteTestResults(config)
    })
  })

  return {port, close: () => server.close()}
}

module.exports = makeAPI
