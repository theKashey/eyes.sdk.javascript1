import * as spec from '@applitools/spec-driver-selenium'
import {getTestInfo} from '@applitools/test-utils'
import {makeCore} from '../../src/index'
import {By, locateWith} from 'selenium-webdriver'
import assert from 'assert'

/**
 * The intent behind this test is to verify several behaviors of coded regions with regionId's:
 * 1. Verify that supported selectors/framework locators are passed in `regionId`.
 * 2. All types of regions should be supported (ignore, layout, content, strict). In order to have all the cases for all types of regions, there is an eyes.check command for each type of check, with many cases of regions, all of the same type.
 * 3. Selectors that target multiple elements should create regionId's with indexes
 * 4. The indexes for multiple elements should be sorted from top-left location in reading order (top-down, left to right)
 *
 * In order to test #4, the test page contains rows with reverse order, so that visually the elements are sorted backwards.
 * This creates the situation that if sorting is not correct, the test will fail. See the page's source here:
 * https://github.com/applitools/demo/blob/gh-pages/TestPages/CodedRegionPage/index.html
 */

describe('coded regions', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  for (const type of ['classic', 'ufg'] as const) {
    it(`region id works - ${type}`, async () => {
      const core = makeCore({spec})

      const manager = await core.makeManager({type, concurrency: 5})
      const eyes = await manager.openEyes({
        target: driver,
        settings: {
          serverUrl: 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY,
          appName: 'js core',
          testName: `coded region regionId ${type}`,
          environment: {viewportSize: {width: 800, height: 600}},
        },
      })
      await driver.get('https://applitools.github.io/demo/TestPages/CodedRegionPage/index.html')
      const el = await driver.findElement(By.css('.region.two:nth-child(2)'))
      const regions = [
        '.region.one:nth-child(1)',
        {selector: '.region.one:nth-child(2)'},
        {selector: '//div[@class="region one"][3]', type: 'xpath'},
        By.css('.region.one:nth-child(4)'),
        By.xpath('//div[@class="region one"][5]'),
        By.js('return document.querySelector(".two:nth-child(1)")'),
        el,
        {region: el, regionId: 'my-custom-id'},
        By.tagName('my-region'),
        locateWith(By.css('.two')).toRightOf(el),
        '.region.three:nth-child(3n)', // 4 regions are targeted by this selector
      ]

      // check #1 - ignore regions
      await eyes.check({settings: {fully: false, ignoreRegions: regions}})

      // check #2 - layout regions
      await eyes.check({settings: {fully: false, layoutRegions: regions}})

      // check #3 - content regions
      await eyes.check({settings: {fully: false, contentRegions: regions}})

      // check #4 - strict regions
      await eyes.check({settings: {fully: false, strictRegions: regions}})

      const expectedRegions = [
        {left: 30, top: 30, width: 100, height: 100, regionId: '.region.one:nth-child(1)'}, // string
        {left: 160, top: 30, width: 100, height: 100, regionId: '.region.one:nth-child(2)'}, // common selector with default type
        {left: 290, top: 30, width: 100, height: 100, regionId: '//div[@class="region one"][3]'}, // common selector with type xpath
        {left: 420, top: 30, width: 100, height: 100, regionId: '.region.one:nth-child(4)'}, // By.css
        {left: 550, top: 30, width: 100, height: 100, regionId: '//div[@class="region one"][5]'}, // By.xpath
        {left: 40, top: 170, width: 200, height: 200}, // By.js
        {left: 280, top: 170, width: 200, height: 200}, // WebElement
        {left: 280, top: 170, width: 200, height: 200, regionId: 'my-custom-id'}, // WebElement with custom id
        {left: 520, top: 170, width: 200, height: 200, regionId: 'my-region'}, // By.tagName
        {left: 520, top: 170, width: 200, height: 200}, // RelativeBy
        {left: 250, top: 420, width: 50, height: 50, regionId: '.region.three:nth-child(3n) (1)'}, // string that targets multiple elements
        {left: 550, top: 420, width: 50, height: 50, regionId: '.region.three:nth-child(3n) (2)'}, // string that targets multiple elements
        {left: 250, top: 520, width: 50, height: 50, regionId: '.region.three:nth-child(3n) (3)'}, // string that targets multiple elements
        {left: 550, top: 520, width: 50, height: 50, regionId: '.region.three:nth-child(3n) (4)'}, // string that targets multiple elements
      ]

      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
      const info = await getTestInfo(result, process.env.APPLITOOLS_API_KEY)
      assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.ignore, expectedRegions)
      assert.deepStrictEqual(info.actualAppOutput[1].imageMatchSettings.layout, expectedRegions)
      assert.deepStrictEqual(info.actualAppOutput[2].imageMatchSettings.content, expectedRegions)
      assert.deepStrictEqual(info.actualAppOutput[3].imageMatchSettings.strict, expectedRegions)
    })
  }

  it(`ufg with non-existent regions`, async () => {
    const core = makeCore({spec})

    const manager = await core.makeManager({type: 'ufg', concurrency: 5})
    const eyes = await manager.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'js core',
        testName: `non-existent coded region`,
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })
    await driver.get('https://applitools.github.io/demo/TestPages/CodedRegionPage/index.html')

    await eyes.check({settings: {fully: false, ignoreRegions: ['.region.one:nth-child(1)', '.made.up.region']}})

    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const info = await getTestInfo(result, process.env.APPLITOOLS_API_KEY)
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.ignore, [
      {left: 30, top: 30, width: 100, height: 100, regionId: '.region.one:nth-child(1)'},
    ])
  })
})
