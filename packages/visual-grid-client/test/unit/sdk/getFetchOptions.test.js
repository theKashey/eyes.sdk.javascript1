'use strict'

const {ProxySettings} = require('@applitools/eyes-sdk-core/shared')
const getFetchOptions = require('../../../src/sdk/getFetchOptions')
const {expect} = require('chai')

describe('getFetchOptions', () => {
  it('adds user-agent and referer header', async () => {
    const referer = 'some referer'
    const userAgent = 'bla'
    expect(getFetchOptions({referer, userAgent})).to.eql({
      headers: {Referer: referer, 'User-Agent': userAgent},
    })
  })

  it('sets tunneling agent when proxySettings is isHttpOnly', async () => {
    const proxySettings = new ProxySettings('http://localhost:8888', 'user', 'pass', true)
    expect(getFetchOptions({proxySettings}).agent.constructor.name).to.equal('TunnelingAgent')
  })
})
