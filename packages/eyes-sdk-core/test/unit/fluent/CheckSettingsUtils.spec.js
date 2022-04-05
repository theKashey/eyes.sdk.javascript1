const assert = require('assert')
const utils = require('@applitools/utils')
const {Driver} = require('@applitools/driver')
const {MockDriver, spec} = require('@applitools/driver/fake')
const {Configuration} = require('../../../index')
const CheckSettingsUtils = require('../../../lib/sdk/CheckSettingsUtils')
const {getResourceAsText} = require('../../testUtils')

const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}

function transformRegion(region) {
  if (utils.types.has(region, ['x', 'y'])) {
    return {left: region.x, top: region.y, width: region.width, height: region.height}
  }
  return region
}

describe('CheckSettingsUtils', () => {
  it('toCheckWindowConfiguration handles regions', async () => {
    const mockDriver = new MockDriver()
    mockDriver.mockElements([
      {selector: 'element0', rect: {x: 1, y: 2, width: 500, height: 501}},
      {selector: 'element1', rect: {x: 10, y: 11, width: 101, height: 102}},
      {selector: 'element1', rect: {x: 12, y: 13, width: 103, height: 104}},
      {selector: 'element2', rect: {x: 20, y: 21, width: 201, height: 202}},
      {selector: 'element3', rect: {x: 30, y: 31, width: 301, height: 302}},
      {selector: 'element4', rect: {x: 40, y: 41, width: 401, height: 402}},
      {selector: 'element4', rect: {x: 42, y: 43, width: 403, height: 404}},
    ])
    const driver = new Driver({logger, spec, driver: mockDriver})
    const checkSettings = {
      ignoreRegions: [await mockDriver.findElement('element0'), 'element1', {x: 1, y: 2, width: 3, height: 5}],
      floatingRegions: [
        {
          region: await mockDriver.findElement('element2'),
          maxUpOffset: 1,
          maxDownOffset: 2,
          maxLeftOffset: 3,
          maxRightOffset: 4,
        },
        {region: 'element3', maxUpOffset: 5, maxDownOffset: 6, maxLeftOffset: 7, maxRightOffset: 8},
        {
          region: {x: 1, y: 2, width: 3, height: 5},
          maxUpOffset: 9,
          maxDownOffset: 10,
          maxLeftOffset: 11,
          maxRightOffset: 12,
        },
      ],
      accessibilityRegions: [{region: 'element4', type: 'bla'}],
    }

    const {persistedCheckSettings} = await CheckSettingsUtils.toPersistedCheckSettings({
      checkSettings,
      context: driver,
      logger,
    })

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: persistedCheckSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.ignore, persistedCheckSettings.ignoreRegions.map(transformRegion))
    assert.deepStrictEqual(
      checkWindowConfiguration.floating,
      persistedCheckSettings.floatingRegions.map(({region, ...offsets}) => ({...transformRegion(region), ...offsets})),
    )
    assert.deepStrictEqual(
      checkWindowConfiguration.accessibility,
      persistedCheckSettings.accessibilityRegions.map(({region, type}) => ({
        ...transformRegion(region),
        accessibilityType: type,
      })),
    )
  })
  // this test is currently not passing, I might need to add some functionalty to MockDriver
  it.skip('toCheckWindowConfiguration handles shadow, frames with target region', async () => {
    const mockDriver = new MockDriver()
    mockDriver.mockElements([
      {
        selector: 'frame1',
        frame: true,
        children: [
          {
            selector: 'shadow1',
            children: [
              {
                selector: 'shadowDoc',
                shadow: true,
                children: [{selector: 'r1'}],
              },
            ],
          },
        ],
      },
    ])
    const driver = new Driver({logger, spec, driver: mockDriver})
    const checkSettings = {
      frame: ['frame1'],
      shadow: ['shadow1'],
      region: 'r1',
      target: 'region',
    }

    const {persistedCheckSettings} = await CheckSettingsUtils.toPersistedCheckSettings({
      checkSettings,
      context: driver.currentContext,
      logger,
    })

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: persistedCheckSettings,
      configuration: new Configuration(),
    })

    const persistedCheckRes = persistedCheckSettings.frame
      .concat(persistedCheckSettings.shadow)
      .concat(persistedCheckSettings.region)

    assert.deepStrictEqual(checkWindowConfiguration.selector, persistedCheckRes)
  })

  it('toCheckWindowConfiguration handles window target', async () => {
    const windowCheckWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: {},
      configuration: new Configuration(),
    })

    assert.strictEqual(windowCheckWindowConfiguration.target, 'viewport')
  })

  it('toCheckWindowConfiguration handles region target with selector', async () => {
    const mockDriver = new MockDriver()
    mockDriver.mockElements([{selector: 'some selector', rect: {x: 1, y: 2, width: 500, height: 501}}])
    const driver = new Driver({logger, spec, driver: mockDriver})

    const regionCheckSettings = {region: 'some selector'}
    const {persistedCheckSettings} = await CheckSettingsUtils.toPersistedCheckSettings({
      checkSettings: regionCheckSettings,
      context: driver,
      logger,
    })

    const regionCheckWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: persistedCheckSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(regionCheckWindowConfiguration.target, 'selector')
    assert.ok(regionCheckWindowConfiguration.selector)
    assert.strictEqual(regionCheckWindowConfiguration.selector.type, 'css')
    assert.strictEqual(regionCheckWindowConfiguration.selector.nodeType, 'element')
    assert.match(
      regionCheckWindowConfiguration.selector.selector,
      /\[data-applitools-selector~="[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}"\]/,
    )
  })

  it('toCheckWindowConfiguration handles region target with element', async () => {
    const mockDriver = new MockDriver()
    mockDriver.mockElements([{selector: 'some selector', rect: {x: 1, y: 2, width: 500, height: 501}}])
    const driver = new Driver({logger, spec, driver: mockDriver})

    const regionCheckSettings = {region: await mockDriver.findElement('some selector')}
    const {persistedCheckSettings} = await CheckSettingsUtils.toPersistedCheckSettings({
      checkSettings: regionCheckSettings,
      context: driver,
      logger,
    })

    const regionCheckWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: persistedCheckSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(regionCheckWindowConfiguration.target, 'selector')
    assert.ok(regionCheckWindowConfiguration.selector)
    assert.strictEqual(regionCheckWindowConfiguration.selector.type, 'css')
    assert.strictEqual(regionCheckWindowConfiguration.selector.nodeType, 'element')
    assert.match(
      regionCheckWindowConfiguration.selector.selector,
      /\[data-applitools-selector~="[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}"\]/,
    )
  })

  it('toCheckWindowConfiguration handles region target with coordinates left/top', async () => {
    const regionCheckSettings = {region: {left: 1, top: 2, width: 500, height: 501}}

    const regionCheckWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: regionCheckSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(regionCheckWindowConfiguration.target, 'region')
    assert.deepStrictEqual(regionCheckWindowConfiguration.region, {x: 1, y: 2, width: 500, height: 501})
  })

  it('toCheckWindowConfiguration handles region target with coordinates x/y', async () => {
    const regionCheckSettings = {region: {x: 1, y: 2, width: 500, height: 501}}

    const regionCheckWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: regionCheckSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(regionCheckWindowConfiguration.target, 'region')
    assert.deepStrictEqual(regionCheckWindowConfiguration.region, {x: 1, y: 2, width: 500, height: 501})
  })

  it('toCheckWindowConfiguration no longer populates `fully` - false with no default', async () => {
    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: {},
      configuration: new Configuration(),
    })

    assert.strictEqual(checkWindowConfiguration.fully, undefined)
  })

  it('toCheckWindowConfiguration no longer populates `fully` - true with no default', async () => {
    const checkSettings = {fully: true}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(checkWindowConfiguration.fully, undefined)
    assert.strictEqual(checkWindowConfiguration.target, 'full-page')
  })

  it('toCheckWindowConfiguration no longer populates `fully` - false with default', async () => {
    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: {},
      configuration: new Configuration({forceFullPageScreenshot: true}),
    })

    assert.strictEqual(checkWindowConfiguration.fully, undefined)
    assert.strictEqual(checkWindowConfiguration.target, 'full-page')
  })

  it('toCheckWindowConfiguration no longer populates `fully` - true with default', async () => {
    const checkSettings = {fully: true}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration({forceFullPageScreenshot: false}),
    })

    assert.strictEqual(checkWindowConfiguration.fully, undefined)
    assert.strictEqual(checkWindowConfiguration.target, 'full-page')
  })

  it('toCheckWindowConfiguration handles tag', async () => {
    const checkSettings = {name: 'some tag'}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(checkWindowConfiguration.tag, 'some tag')
  })

  it('toCheckWindowConfiguration handles scriptHooks', async () => {
    const checkSettings = {
      hooks: {beforeCaptureScreenshot: 'some hook'},
    }

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.scriptHooks, {
      beforeCaptureScreenshot: 'some hook',
    })
  })

  it('toCheckWindowConfiguration handles sendDom', async () => {
    const checkSettings = {sendDom: true}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(checkWindowConfiguration.sendDom, true)
  })

  it('toCheckWindowConfiguration handles matchLevel with no default', async () => {
    const checkSettings = {matchLevel: 'some match level'}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.strictEqual(checkWindowConfiguration.matchLevel, 'some match level')
  })

  it('toCheckWindowConfiguration handles matchLevel with default', async () => {
    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: {},
      configuration: new Configuration({
        defaultMatchSettings: {matchLevel: 'Layout'},
      }),
    })

    assert.strictEqual(checkWindowConfiguration.matchLevel, 'Layout')
  })

  it('toCheckWindowConfiguration handles matchLevel with default overriden', async () => {
    const checkSettings = {matchLevel: 'some match level'}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration({
        defaultMatchSettings: {matchLevel: 'Layout'},
      }),
    })

    assert.strictEqual(checkWindowConfiguration.matchLevel, 'some match level')
  })

  it('toCheckWindowConfiguration handles visualGridOptions with no default', async () => {
    const checkSettings = {
      visualGridOptions: {polyfillAdoptedStyleSheets: true},
    }

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.visualGridOptions, {
      polyfillAdoptedStyleSheets: true,
    })
  })

  it('toCheckWindowConfiguration handles visualGridOptions with default', async () => {
    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings: {},
      configuration: new Configuration({visualGridOptions: {polyfillAdoptedStyleSheets: true}}),
    })

    assert.deepStrictEqual(checkWindowConfiguration.visualGridOptions, {
      polyfillAdoptedStyleSheets: true,
    })
  })

  it('toCheckWindowConfiguration handles visualGridOptions with default overriden', async () => {
    const checkSettings = {
      visualGridOptions: {polyfillAdoptedStyleSheets: true},
    }

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration({visualGridOptions: {polyfillAdoptedStyleSheets: false}}),
    })

    assert.deepStrictEqual(checkWindowConfiguration.visualGridOptions, {
      polyfillAdoptedStyleSheets: true,
    })
  })

  it('toCheckWindowConfiguration handles visualGridOptions with plural API', async () => {
    const checkSettings = {
      visualGridOptions: {polyfillAdoptedStyleSheets: true},
    }

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.visualGridOptions, {
      polyfillAdoptedStyleSheets: true,
    })
  })

  it('toCheckWindowConfiguration handles enablePatterns', () => {
    const checkSettings = {enablePatterns: true}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.enablePatterns, true)
  })

  it('toCheckWindowConfiguration handles useDom', () => {
    const checkSettings = {useDom: true}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.useDom, true)
  })

  it('toCheckWindowConfiguration handles variationGroupId', () => {
    const checkSettings = {variationGroupId: 'variant-id'}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.variationGroupId, 'variant-id')
  })

  it('toCheckWindowConfiguration handles pageId', () => {
    const checkSettings = {pageId: 'my-page'}

    const checkWindowConfiguration = CheckSettingsUtils.toCheckWindowConfiguration({
      checkSettings,
      configuration: new Configuration(),
    })

    assert.deepStrictEqual(checkWindowConfiguration.pageId, 'my-page')
  })

  describe('toMatchSettings', () => {
    let mockDriver,
      driver,
      region1 = {x: 1, y: 2, width: 3, height: 4},
      region2 = {x: 5, y: 6, width: 7, height: 8},
      screenshot = {region: {x: 1, y: 1, width: 1000, height: 1000}}

    before(async () => {
      mockDriver = new MockDriver()
      mockDriver.mockElement('custom selector', {rect: region1})
      mockDriver.mockElement('custom selector', {rect: region2})
      driver = await new Driver({logger, spec, driver: mockDriver}).init()
    })

    it('handle region by coordinates', async () => {
      const checkSettings = {ignoreRegions: [{x: 15, y: 16, width: 17, height: 18}]}
      const matchSettings = await CheckSettingsUtils.toMatchSettings({
        checkSettings,
        configuration: new Configuration(),
        screenshot,
        context: driver,
        logger,
      })

      assert.deepStrictEqual(
        matchSettings.getIgnoreRegions().map(region => region.toJSON()),
        [{left: 15, top: 16, width: 17, height: 18}],
      )
    })

    it('handle region by coordinates with options', async () => {
      const checkSettings = {
        accessibilityRegions: [{region: {x: 15, y: 16, width: 17, height: 18}, type: 'RegularText'}],
      }
      const matchSettings = await CheckSettingsUtils.toMatchSettings({
        checkSettings,
        configuration: new Configuration(),
        screenshot,
        context: driver,
        logger,
      })

      assert.deepStrictEqual(
        matchSettings.getAccessibilityRegions().map(region => region.toJSON()),
        [{left: 15, top: 16, width: 17, height: 18, type: 'RegularText'}],
      )
    })

    it('handle region by selector', async () => {
      const checkSettings = {ignoreRegions: ['custom selector']}

      const screenshotCheckSettings = await CheckSettingsUtils.toScreenshotCheckSettings({
        checkSettings,
        context: driver.currentContext,
        screenshot,
      })

      const matchSettings = await CheckSettingsUtils.toMatchSettings({
        checkSettings: screenshotCheckSettings,
        configuration: new Configuration(),
      })

      assert.deepStrictEqual(
        matchSettings.getIgnoreRegions().map(region => region.toJSON()),
        [
          {left: region1.x - 1, top: region1.y - 1, width: region1.width, height: region1.height},
          {left: region2.x - 1, top: region2.y - 1, width: region2.width, height: region2.height},
        ],
      )
    })

    it('handle region by selector with options', async () => {
      const checkSettings = {accessibilityRegions: [{region: 'custom selector', type: 'RegularText'}]}

      const screenshotCheckSettings = await CheckSettingsUtils.toScreenshotCheckSettings({
        checkSettings,
        context: driver.currentContext,
        screenshot,
      })

      const matchSettings = await CheckSettingsUtils.toMatchSettings({
        checkSettings: screenshotCheckSettings,
        configuration: new Configuration(),
      })

      assert.deepStrictEqual(
        matchSettings.getAccessibilityRegions().map(region => region.toJSON()),
        [
          {left: region1.x - 1, top: region1.y - 1, width: region1.width, height: region1.height, type: 'RegularText'},
          {left: region2.x - 1, top: region2.y - 1, width: region2.width, height: region2.height, type: 'RegularText'},
        ],
      )
    })

    it('handle region by element', async () => {
      const checkSettings = {ignoreRegions: [await mockDriver.findElement('custom selector')]}

      const screenshotCheckSettings = await CheckSettingsUtils.toScreenshotCheckSettings({
        checkSettings,
        context: driver.currentContext,
        screenshot,
      })

      const matchSettings = await CheckSettingsUtils.toMatchSettings({
        checkSettings: screenshotCheckSettings,
        configuration: new Configuration(),
      })
      assert.deepStrictEqual(
        matchSettings.getIgnoreRegions().map(region => region.toJSON()),
        [{left: region1.x - 1, top: region1.y - 1, width: region1.width, height: region1.height}],
      )
    })
    ;[
      {useDom: true, enablePatterns: true, ignoreDisplacements: true},
      {useDom: true, enablePatterns: true, ignoreDisplacements: false},
      {useDom: true, enablePatterns: false, ignoreDisplacements: true},
      {useDom: true, enablePatterns: false, ignoreDisplacements: false},
      {useDom: false, enablePatterns: true, ignoreDisplacements: true},
      {useDom: false, enablePatterns: true, ignoreDisplacements: false},
      {useDom: false, enablePatterns: false, ignoreDisplacements: true},
      {useDom: false, enablePatterns: false, ignoreDisplacements: false},
    ].forEach(({useDom, enablePatterns, ignoreDisplacements}) => {
      it(`TestFluentApiSerialization (${useDom}, ${enablePatterns}, ${ignoreDisplacements})`, async () => {
        const imageMatchSettings = await CheckSettingsUtils.toMatchSettings({
          checkSettings: {fully: true, useDom, enablePatterns, ignoreDisplacements},
          configuration: new Configuration(),
        })

        const actualSerialization = JSON.stringify(imageMatchSettings)
        const expectedSerialization = getResourceAsText(
          `SessionStartInfo_FluentApiSerialization_${useDom}_${enablePatterns}_${ignoreDisplacements}.json`,
        )
        assert.strictEqual(actualSerialization, expectedSerialization)
      })

      it(`TestImageMatchSettingsSerialization_Global (${useDom}, ${enablePatterns}, ${ignoreDisplacements})`, async () => {
        const imageMatchSettings = await CheckSettingsUtils.toMatchSettings({
          checkSettings: {fully: true, useDom, enablePatterns},
          configuration: new Configuration({defaultMatchSettings: {ignoreDisplacements}}),
        })

        const actualSerialization = JSON.stringify(imageMatchSettings)
        const expectedSerialization = getResourceAsText(
          `SessionStartInfo_FluentApiSerialization_${useDom}_${enablePatterns}_${ignoreDisplacements}.json`,
        )
        assert.strictEqual(
          actualSerialization,
          expectedSerialization,
          'ImageMatchSettings serialization does not match!',
        )
      })

      it(`TestConfigurationSerialization (${useDom}, ${enablePatterns}, ${ignoreDisplacements})`, async () => {
        const imageMatchSettings = await CheckSettingsUtils.toMatchSettings({
          checkSettings: {fully: true},
          configuration: new Configuration({defaultMatchSettings: {useDom, enablePatterns, ignoreDisplacements}}),
        })

        const actualSerialization = JSON.stringify(imageMatchSettings)
        const expectedSerialization = getResourceAsText(
          `SessionStartInfo_FluentApiSerialization_${useDom}_${enablePatterns}_${ignoreDisplacements}.json`,
        )
        assert.strictEqual(
          actualSerialization,
          expectedSerialization,
          'ImageMatchSettings serialization does not match!',
        )
      })
    })
  })
})
