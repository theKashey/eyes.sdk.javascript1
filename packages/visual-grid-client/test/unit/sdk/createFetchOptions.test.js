const {expect} = require('chai')
const {ProxySettings} = require('@applitools/eyes-sdk-core/shared')
const createFetchOptions = require('../../../src/sdk/resources/createFetchOptions')

describe('createFetchOptions', () => {
  it('adds user-agent and referer header', async () => {
    const referer = 'some referer'
    const userAgent = 'bla'
    expect(createFetchOptions({}, {referer, userAgent})).to.eql({
      headers: {Referer: referer, 'User-Agent': userAgent},
    })
  })

  it('sets tunneling agent when proxySettings is isHttpOnly', async () => {
    const proxy = new ProxySettings('http://localhost:8888', 'user', 'pass', true)
    expect(createFetchOptions({}, {proxy}).agent.constructor.name).to.equal('TunnelingAgent')
  })
})
