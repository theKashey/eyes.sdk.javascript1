const {WebSocket} = require('ws')
const {makeServer} = require('../../dist/universal-server')
const {EyesManagerConfig, EyesConfig} = require('@applitools/types')

describe.skip('eyes e2e', () => {
  let server, socket, managerRef

  async function send({name, payload}) {
    await socket.send(
      JSON.stringify({name, payload})
    )
  }

  before(async () => {
    server = await makeServer()
    socket = new WebSocket(`http://localhost:${server.port}/eyes`)
    await send({
      name: 'Core.makeSDK',
      payload: {
        name: 'some-sdk',
        commands: [],
        cwd: process.cwd(),
      }
    })
    managerRef = await send({name: 'Core.makeManager', config: EyesManagerConfig})
    await send({
      name: 'EyesManager.openEyes',
      payload: {manager, driver, config: EyesConfig}
    })
  })
  after(() => {
    server.close()
  })
  it('abort fails gracefully', async () => {
    
  })
})
