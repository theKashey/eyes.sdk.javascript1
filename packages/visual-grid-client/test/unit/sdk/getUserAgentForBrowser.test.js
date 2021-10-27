'use strict'
const {describe, it} = require('mocha')
const {expect} = require('chai')
const {getUserAgentForBrowser, userAgent} = require('../../../src/sdk/getUserAgentForBrowser')

describe('getUserAgentForBrowser', () => {
  it('works for all supported browsers', () => {
    const chromeUserAgent = getUserAgentForBrowser('chrome')
    expect(chromeUserAgent).to.eql(userAgent.Chrome)
    const IE10UserAgent = getUserAgentForBrowser('ie10')
    expect(IE10UserAgent).to.eql(userAgent.IE)
    const IE11UserAgent = getUserAgentForBrowser('ie11')
    expect(IE11UserAgent).to.eql(userAgent.IE)
    const FirefoxUserAgent = getUserAgentForBrowser('firefox-1')
    expect(FirefoxUserAgent).to.eql(userAgent.Firefox)
    const SafariUserAgent = getUserAgentForBrowser('safari')
    expect(SafariUserAgent).to.eql(userAgent.Safari)
    const EdgeUserAgent = getUserAgentForBrowser('edge-2')
    expect(EdgeUserAgent).to.eql(userAgent.Edge)
    const EdgechromuimUserAgent = getUserAgentForBrowser('edgechromium')
    expect(EdgechromuimUserAgent).to.eql(userAgent.Edgechromium)
  })
})
