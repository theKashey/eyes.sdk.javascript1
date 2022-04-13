const {Driver} = require('@applitools/driver')
const {MockDriver, spec} = require('@applitools/driver/fake')
const {makeLogger} = require('@applitools/logger')
const takeDomSnapshot = require('../../lib/utils/takeDomSnapshot')
const {expect} = require('chai')
const {presult} = require('../../lib/utils/GeneralUtils')

const logger = makeLogger()

describe('takeDomSnapshot', () => {
  let mock, driver

  beforeEach(async () => {
    mock = new MockDriver()
    driver = new Driver({logger, spec, driver: mock})
    await driver.init()
  })

  it('should throw an error if snapshot failed', async () => {
    mock.mockScript('dom-snapshot', function() {
      return JSON.stringify({status: 'ERROR', error: 'some error'})
    })
    const [error] = await presult(takeDomSnapshot(logger, driver.currentContext))
    expect(error).not.to.be.undefined
    expect(error.message).to.equal("Error during execute poll script: 'some error'")
  })

  it('should throw an error if timeout is reached', async () => {
    mock.mockScript('dom-snapshot', function() {
      return JSON.stringify({status: 'WIP'})
    })
    const [error] = await presult(takeDomSnapshot(logger, driver.currentContext, {executionTimeout: 0}))
    expect(error).not.to.be.undefined
    expect(error.message).to.equal('Poll script execution is timed out')
  })

  it('should take a dom snapshot', async () => {
    mock.mockScript('dom-snapshot', function() {
      return generateSnapshotResponse({
        cdt: 'cdt',
        resourceUrls: 'resourceUrls',
        blobs: [],
        frames: [],
      })
    })
    const actualSnapshot = await takeDomSnapshot(logger, driver.currentContext)
    expect(actualSnapshot).to.eql({
      cdt: 'cdt',
      frames: [],
      resourceContents: {},
      resourceUrls: 'resourceUrls',
      frames: [],
      srcAttr: null,
      scriptVersion: 'mock value',
    })
  })

  it('should take a dom snapshot with cross origin frames', async () => {
    mock.mockElements([
      {
        selector: '[data-applitools-selector="123"]',
        frame: true,
      },
    ])
    mock.mockScript('dom-snapshot', function() {
      return this.name === '[data-applitools-selector="123"]'
        ? generateSnapshotResponse({cdt: 'frame-cdt', url: 'http://cors.com'})
        : generateSnapshotResponse({
            cdt: [{nodeName: 'IFRAME', attributes: [{name: 'cross-origin-iframe', value: true}]}],
            crossFrames: [{selector: '[data-applitools-selector="123"]', index: 0}],
          })
    })
    const snapshot = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}`,
    })
    expect(snapshot).to.eql({
      cdt: [
        {
          nodeName: 'IFRAME',
          attributes: [
            {name: 'cross-origin-iframe', value: true},
            {name: 'data-applitools-src', value: 'URL:http://cors.com--QUERY:applitools-iframe'},
          ],
        },
      ],
      resourceContents: {},
      resourceUrls: [],
      scriptVersion: 'mock value',
      srcAttr: null,
      frames: [
        {
          cdt: 'frame-cdt',
          frames: [],
          url: 'URL:http://cors.com--QUERY:applitools-iframe',
          resourceContents: {},
          resourceUrls: [],
          scriptVersion: 'mock value',
          srcAttr: null,
        },
      ],
    })
  })

  it('should take a dom snapshot with cross origin frames with the same src attr', async () => {
    mock.mockElements([
      {
        selector: '[data-applitools-selector="123"]',
        frame: true,
      },
      {
        selector: '[data-applitools-selector="456"]',
        frame: true,
      },
    ])
    mock.mockScript('dom-snapshot', function() {
      switch (this.name) {
        case '[data-applitools-selector="123"]':
          return generateSnapshotResponse({
            cdt: 'frame-cdt',
            url: 'http://cors.com',
          })
        case '[data-applitools-selector="456"]':
          return generateSnapshotResponse({
            cdt: 'another-frame-cdt',
            url: 'http://cors.com',
          })
        default:
          return generateSnapshotResponse({
            cdt: [
              {nodeName: 'IFRAME', attributes: [{name: 'cross-origin-frame-1', value: true}]},
              {nodeName: 'IFRAME', attributes: [{name: 'cross-origin-frame-2', value: true}]},
            ],
            crossFrames: [
              {selector: '[data-applitools-selector="123"]', index: 0},
              {selector: '[data-applitools-selector="456"]', index: 1},
            ],
          })
      }
    })
    let counter = 0

    const snapshot = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}--COUNTER:${counter++}`,
    })
    expect(snapshot).to.eql({
      cdt: [
        {
          nodeName: 'IFRAME',
          attributes: [
            {name: 'cross-origin-frame-1', value: true},
            {
              name: 'data-applitools-src',
              value: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:0',
            },
          ],
        },
        {
          nodeName: 'IFRAME',
          attributes: [
            {name: 'cross-origin-frame-2', value: true},
            {
              name: 'data-applitools-src',
              value: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:1',
            },
          ],
        },
      ],
      resourceContents: {},
      resourceUrls: [],
      scriptVersion: 'mock value',
      srcAttr: null,
      frames: [
        {
          cdt: 'frame-cdt',
          frames: [],
          url: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:0',
          resourceContents: {},
          resourceUrls: [],
          scriptVersion: 'mock value',
          srcAttr: null,
        },
        {
          cdt: 'another-frame-cdt',
          frames: [],
          url: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:1',
          resourceContents: {},
          resourceUrls: [],
          scriptVersion: 'mock value',
          srcAttr: null,
        },
      ],
    })
  })

  it('should take a dom snapshot with nested cross origin frames', async () => {
    mock.mockElements([
      {
        selector: '[data-applitools-selector="123"]',
        frame: true,
        children: [
          {
            selector: '[data-applitools-selector="456"]',
            frame: true,
          },
        ],
      },
    ])

    mock.mockScript('dom-snapshot', function() {
      switch (this.name) {
        case '[data-applitools-selector="123"]':
          return generateSnapshotResponse({
            cdt: [{nodeName: 'IFRAME', attributes: [{name: 'nested-cross-origin-frame', value: true}]}],
            url: 'http://cors.com',
            crossFrames: [{selector: '[data-applitools-selector="456"]', index: 0}],
          })
        case '[data-applitools-selector="456"]':
          return generateSnapshotResponse({
            cdt: 'nested frame',
            url: 'http://cors-2.com',
          })
        default:
          return generateSnapshotResponse({
            cdt: [{nodeName: 'IFRAME', attributes: [{name: 'cross-origin-frame', value: true}]}],
            crossFrames: [{selector: '[data-applitools-selector="123"]', index: 0}],
          })
      }
    })

    let counter = 0

    const snapshot = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}--COUNTER:${counter++}`,
    })

    expect(snapshot).to.eql({
      cdt: [
        {
          nodeName: 'IFRAME',
          attributes: [
            {name: 'cross-origin-frame', value: true},
            {
              name: 'data-applitools-src',
              value: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:1',
            },
          ],
        },
      ],
      frames: [
        {
          cdt: [
            {
              nodeName: 'IFRAME',
              attributes: [
                {name: 'nested-cross-origin-frame', value: true},
                {
                  name: 'data-applitools-src',
                  value: 'URL:http://cors-2.com--QUERY:applitools-iframe--COUNTER:0',
                },
              ],
            },
          ],
          frames: [
            {
              cdt: 'nested frame',
              frames: [],
              url: 'URL:http://cors-2.com--QUERY:applitools-iframe--COUNTER:0',
              resourceContents: {},
              resourceUrls: [],
              scriptVersion: 'mock value',
              srcAttr: null,
            },
          ],
          url: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:1',
          resourceContents: {},
          resourceUrls: [],
          scriptVersion: 'mock value',
          srcAttr: null,
        },
      ],
      resourceContents: {},
      resourceUrls: [],
      scriptVersion: 'mock value',
      srcAttr: null,
    })
  })

  it('should take a dom snapshot with nested frames containing cross origin frames', async () => {
    mock.mockElements([
      {
        selector: '[data-applitools-selector="123"]',
        frame: true,
        children: [
          {
            selector: '[data-applitools-selector="456"]',
            frame: true,
          },
        ],
      },
    ])

    mock.mockScript('dom-snapshot', function() {
      switch (this.name) {
        case '[data-applitools-selector="456"]':
          return generateSnapshotResponse({
            cdt: 'nested frame',
            url: 'http://cors.com',
            selector: '[data-applitools-selector="456"]',
          })
        default:
          return generateSnapshotResponse({
            cdt: 'top page',
            frames: [
              generateSnapshotObject({
                cdt: [{nodeName: 'IFRAME', attributes: [{name: 'cross-origin-frame', value: true}]}],
                url: 'http://same-origin',
                selector: '[data-applitools-selector="123"]',
                crossFrames: [{selector: '[data-applitools-selector="456"]', index: 0}],
              }),
            ],
          })
      }
    })

    let counter = 0

    const snapshot = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}--COUNTER:${counter++}`,
    })

    expect(snapshot).to.eql({
      cdt: 'top page',
      frames: [
        {
          cdt: [
            {
              nodeName: 'IFRAME',
              attributes: [
                {name: 'cross-origin-frame', value: true},
                {
                  name: 'data-applitools-src',
                  value: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:0',
                },
              ],
            },
          ],
          frames: [
            {
              cdt: 'nested frame',
              url: 'URL:http://cors.com--QUERY:applitools-iframe--COUNTER:0',
              frames: [],
              resourceContents: {},
              resourceUrls: [],
              scriptVersion: 'mock value',
              srcAttr: null,
            },
          ],
          resourceContents: {},
          resourceUrls: [],
          scriptVersion: 'mock value',
          srcAttr: null,
          url: 'http://same-origin',
        },
      ],
      resourceContents: {},
      resourceUrls: [],
      scriptVersion: 'mock value',
      srcAttr: null,
    })
  })

  it('should handle failure to switch to frame', async () => {
    mock.mockElements([
      {
        selector: '[data-applitools-selector="123"]',
      },
    ])
    mock.mockScript('dom-snapshot', function() {
      return generateSnapshotResponse({
        cdt: 'top frame',
        crossFrames: [{selector: '[data-applitools-selector="123"]', index: 0}],
      })
    })

    const snapshot = await takeDomSnapshot(logger, driver.currentContext)
    expect(snapshot.frames).to.deep.equal([])
  })

  it('should handle failure to switch to nested frame', async () => {
    const url = 'https://some_url.com'
    mock.mockElements([
      {
        selector: '[data-applitools-selector="123"]',
        frame: true,
        isCORS: true,
        children: [
          {
            selector: '[data-applitools-selector="456"]',
          },
        ],
      },
    ])
    mock.mockScript('dom-snapshot', function() {
      switch (this.name) {
        case '[data-applitools-selector="123"]':
          return generateSnapshotResponse({
            cdt: 'inner parent frame',
            url,
            crossFrames: [{selector: '[data-applitools-selector="456"]', index: 0}],
          })
        default:
          return generateSnapshotResponse({
            cdt: [{nodeName: 'IFRAME', attributes: []}],
            crossFrames: [{selector: '[data-applitools-selector="123"]', index: 0}],
          })
      }
    })

    const snapshot = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}`,
    })
    expect(snapshot.frames).to.eql([
      {
        cdt: 'inner parent frame',
        resourceContents: {},
        resourceUrls: [],
        frames: [],
        scriptVersion: 'mock value',
        srcAttr: null,
        url: 'URL:https://some_url.com--QUERY:applitools-iframe',
      },
    ])
  })

  it('should add data-applitools-src to the cors frame cdt node', async () => {
    mock.mockElements([
      {
        name: 'cors-frame',
        selector: '[data-applitools-selector="1"]',
        frame: true,
        isCORS: true,
      },
    ])
    mock.mockScript('dom-snapshot', function() {
      switch (this.name) {
        case 'cors-frame':
          return generateSnapshotResponse({
            cdt: 'cors frame',
            url: 'http://cors.com',
          })
        default:
          return generateSnapshotResponse({
            cdt: [{nodeName: 'IFRAME', attributes: []}],
            crossFrames: [{selector: '[data-applitools-selector="1"]', index: 0}],
          })
      }
    })
    const {cdt} = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}`,
    })
    expect(cdt).to.deep.equal([
      {
        nodeName: 'IFRAME',
        attributes: [{name: 'data-applitools-src', value: 'URL:http://cors.com--QUERY:applitools-iframe'}],
      },
    ])
  })

  it('should modify data urls on iframes', async () => {
    // the following is a mock of an element like this: <iframe src="data:text/html,<div>hi there</div>"></iframe>
    mock.mockElements([
      {
        name: 'some-frame-with-data-url',
        selector: '[data-applitools-selector="1"]',
        frame: true,
        isCORS: true,
      },
    ])
    mock.mockScript('dom-snapshot', function() {
      switch (this.name) {
        case 'some-frame-with-data-url':
          return generateSnapshotResponse({
            cdt: 'some frame with data url',
            url: 'data:text/html,bla bla bla',
          })
        default:
          return generateSnapshotResponse({
            cdt: [{nodeName: 'IFRAME', attributes: []}],
            crossFrames: [{selector: '[data-applitools-selector="1"]', index: 0}],
          })
      }
    })
    const snapshot = await takeDomSnapshot(logger, driver.currentContext, {
      uniqueUrl: (url, query) => `URL:${url}--QUERY:${query}`,
    })
    expect(snapshot).to.eql({
      cdt: [
        {
          nodeName: 'IFRAME',
          attributes: [{name: 'data-applitools-src', value: 'URL:http://data-url-frame--QUERY:applitools-iframe'}],
        },
      ],
      resourceContents: {},
      resourceUrls: [],
      scriptVersion: 'mock value',
      srcAttr: null,
      frames: [
        {
          cdt: 'some frame with data url',
          resourceContents: {},
          resourceUrls: [],
          scriptVersion: 'mock value',
          srcAttr: null,
          url: 'URL:http://data-url-frame--QUERY:applitools-iframe',
          frames: [],
        },
      ],
    })
  })
})

function generateSnapshotResponse(overrides) {
  return JSON.stringify({status: 'SUCCESS', value: generateSnapshotObject(overrides)})
}

function generateSnapshotObject(overrides) {
  return {
    cdt: [],
    srcAttr: null,
    resourceUrls: [],
    blobs: [],
    frames: [],
    crossFrames: undefined,
    scriptVersion: 'mock value',
    ...overrides,
  }
}
