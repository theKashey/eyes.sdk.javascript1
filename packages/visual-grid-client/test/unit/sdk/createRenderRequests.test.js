const {expect} = require('chai')
const createRenderRequest = require('../../../src/sdk/createRenderRequest')
const createResource = require('../../../src/sdk/resources/createResource')
const createDomResource = require('../../../src/sdk/resources/createDomResource')

describe('createRenderRequest', () => {
  let renderInfo, url, resources, dom

  beforeEach(() => {
    renderInfo = {
      getResultsUrl: () => 'resultsUrl',
      getStitchingServiceUrl: () => 'stitchingServiceUrl',
    }
    url = 'url'
    const resource1 = createResource({url: 'url1', value: 'content1'})
    const resource2 = createResource({url: 'url2', value: 'content2'})
    resources = {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash}
    dom = createDomResource({cdt: 'cdt', resources}).hash
  })

  it('works', () => {
    const resource1 = createResource({url: 'url1', value: 'content1'})
    const resource2 = createResource({url: 'url2', value: 'content2'})
    const resources = {[resource1.url]: resource1.hash, [resource2.url]: resource2.hash}
    const dom = createDomResource({cdt: 'cdt', resources})

    const renderRequest = createRenderRequest({
      url,
      dom,
      resources,
      browser: {width: 1, height: 2, name: 'b1'},
      renderInfo,
      sizeMode: 'sizeMode',
      selector: 'selector',
      region: {left: 1, top: 2, width: 3, height: 4},
      scriptHooks: 'scriptHooks',
      sendDom: 'sendDom',
      userRegions: [],
    })

    expect(renderRequest.toJSON()).to.eql({
      webhook: 'resultsUrl',
      stitchingService: 'stitchingServiceUrl',
      url,
      dom,
      resources: resources,
      browser: {name: 'b1'},
      scriptHooks: 'scriptHooks',
      sendDom: 'sendDom',
      enableMultipleResultsPerSelector: true,
      renderInfo: {
        width: 1,
        height: 2,
        selector: 'selector',
        sizeMode: 'sizeMode',
        region: {x: 1, y: 2, width: 3, height: 4},
      },
    })
  })

  it('handles emulation info with deviceName', () => {
    const deviceName = 'deviceName'
    const screenOrientation = 'screenOrientation'
    const browser = {deviceName, screenOrientation}
    const renderRequest = createRenderRequest({
      url,
      dom,
      resources,
      browser,
      renderInfo,
      userRegions: [],
    })

    expect(renderRequest.toJSON()).to.eql({
      webhook: 'resultsUrl',
      stitchingService: 'stitchingServiceUrl',
      url,
      dom,
      resources,
      enableMultipleResultsPerSelector: true,
      renderInfo: {
        emulationInfo: {deviceName, screenOrientation},
        height: undefined,
        width: undefined,
        selector: undefined,
        region: undefined,
        sizeMode: undefined,
      },
    })
  })

  it('handles emulation info with device', () => {
    const browser = {width: 1, height: 2, deviceScaleFactor: 3}
    const renderInfo = {
      getResultsUrl: () => 'resultsUrl',
      getStitchingServiceUrl: () => 'stitchingServiceUrl',
    }
    const renderRequest = createRenderRequest({
      url,
      dom,
      resources,
      browser,
      renderInfo,
      userRegions: [],
    })

    expect(renderRequest.toJSON()).to.eql({
      webhook: 'resultsUrl',
      stitchingService: 'stitchingServiceUrl',
      url,
      dom,
      resources,
      enableMultipleResultsPerSelector: true,
      renderInfo: {
        emulationInfo: {
          width: 1,
          height: 2,
          deviceScaleFactor: 3,
          screenOrientation: undefined,
          mobile: undefined,
        },
        height: 2,
        width: 1,
        selector: undefined,
        region: undefined,
        sizeMode: undefined,
      },
    })
  })

  it('handles selectorsToFindRegionsFor', () => {
    const browser = {width: 1, height: 2}
    const renderRequest = createRenderRequest({
      url,
      dom,
      resources,
      browser,
      renderInfo,
      selectorsToFindRegionsFor: [{selector: 'bla', type: 'css'}],
    })

    expect(renderRequest.toJSON()).to.eql({
      webhook: 'resultsUrl',
      stitchingService: 'stitchingServiceUrl',
      url,
      dom,
      resources,
      enableMultipleResultsPerSelector: true,
      renderInfo: {
        height: 2,
        width: 1,
        selector: undefined,
        region: undefined,
        sizeMode: undefined,
      },
      selectorsToFindRegionsFor: [{type: 'css', selector: 'bla'}],
    })
  })

  it('handles iosDeviceInfo', () => {
    const iosDeviceInfo = {
      deviceName: 'ios device',
      iosVersion: 'ios version',
      screenOrientation: 'ios screen orientation',
    }
    const browser = {iosDeviceInfo}
    const renderRequest = createRenderRequest({
      url,
      dom,
      resources,
      browser,
      renderInfo,
    })

    expect(renderRequest.toJSON()).to.eql({
      webhook: 'resultsUrl',
      stitchingService: 'stitchingServiceUrl',
      url,
      dom,
      resources,
      browser: {name: 'safari'},
      platform: {name: 'ios'},
      enableMultipleResultsPerSelector: true,
      renderInfo: {
        iosDeviceInfo: {
          name: 'ios device',
          version: 'ios version',
          screenOrientation: 'ios screen orientation',
        },
        region: undefined,
        selector: undefined,
        sizeMode: undefined,
        width: undefined,
        height: undefined,
      },
    })
  })
})
