'use strict'

const assert = require('assert')
const {
  VisualGridRunner,
  EyesClassic,
  EyesVisualGrid,
  Configuration,
  StitchMode,
  RectangleSize,
  ProxySettings,
  BatchInfo,
  PropertyData,
} = require('../../index')
const {EyesFactory} = require('../utils/FakeSDK')

describe('EyesFactory', function() {
  it('should create EyesClassic by default', async function() {
    const eyes = new EyesFactory()
    assert.ok(!eyes.isVisualGrid())
    assert.ok(eyes instanceof EyesClassic)
  })

  it('should create EyesVisualGrid with VisualGridRunner', async function() {
    const eyes = new EyesFactory(new VisualGridRunner())
    assert.ok(eyes.isVisualGrid())
    assert.ok(eyes instanceof EyesVisualGrid)
  })

  it('should create an EyesClassic instance through fromBrowserInfo', () => {
    const eyes = EyesFactory.fromBrowserInfo()
    assert.ok(eyes instanceof EyesClassic)
  })

  it('should create an EyesVisualGrid instance through fromBrowserInfo', () => {
    const eyes = EyesFactory.fromBrowserInfo(undefined, undefined, {
      browser: [{name: 'iPhone 4', width: 400, height: 600}],
    })
    assert.ok(eyes instanceof EyesVisualGrid)
  })

  it('set configuration from object', async function() {
    const eyes = new EyesFactory(new VisualGridRunner())
    const date = new Date()
    eyes.setConfiguration({
      apiKey: 'sameApiKey',
      forceFullPageScreenshot: true,
      stitchMode: 'Scroll',
      browsersInfo: [
        {
          width: 800,
          height: 600,
          name: 'firefox',
        },
        {
          deviceName: 'iPhone 4',
          screenOrientation: 'portrait',
        },
      ],
      viewportSize: {
        width: 450,
        height: 500,
      },
      proxy: 'http://localhost:8888',
      batch: {
        id: 'randomId',
        name: 'Batch name',
        startedAt: date,
      },
      properties: [
        {
          name: 'prop',
          value: 'value',
        },
      ],
      baselineEnvName: 'baselineEnvName',
      sendDom: false,
    })

    const configuration = eyes.getConfiguration()

    assert.ok(configuration instanceof Configuration)
    assert.strictEqual(configuration.getApiKey(), 'sameApiKey')
    assert.strictEqual(configuration.getForceFullPageScreenshot(), true)
    assert.strictEqual(configuration.getStitchMode(), StitchMode.SCROLL)
    assert.strictEqual(configuration.getBrowsersInfo().length, 2)
    assert.deepStrictEqual(configuration.getBrowsersInfo()[0], {
      width: 800,
      height: 600,
      name: 'firefox',
    })
    assert.deepStrictEqual(configuration.getBrowsersInfo()[1], {
      deviceName: 'iPhone 4',
      screenOrientation: 'portrait',
    })
    assert.deepStrictEqual(configuration.getViewportSize(), new RectangleSize(450, 500))
    assert.deepStrictEqual(configuration.getProxy(), new ProxySettings('http://localhost:8888'))
    assert.deepStrictEqual(configuration.getBatch(), new BatchInfo('Batch name', date, 'randomId'))
    assert.strictEqual(configuration.getProperties().length, 1)
    assert.deepStrictEqual(configuration.getProperties()[0], new PropertyData('prop', 'value'))
    assert.strictEqual(configuration.getBaselineEnvName(), 'baselineEnvName')
    assert.strictEqual(configuration.getSendDom(), false)
  })
})
