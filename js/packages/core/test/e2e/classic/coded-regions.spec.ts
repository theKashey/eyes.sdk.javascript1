import {makeCore} from '../../../src/classic/core'
import {getTestInfo} from '@applitools/test-utils'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

describe('coded regions', () => {
  let driver, destroyDriver, core

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})
    const page = `data:text/html,
      <div id='outer' style='margin-left: 50px; width:600px; height: 2000px; border: 1px solid;'>
        Outer
        <div id='inner' style='width: 200px; height: 200px; position:relative; margin-top: 500px;'>
          Inner
        </div>
      </div>`
    await driver.get(page)
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works in full page', async () => {
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core classic',
        testName: 'coded region in full page',
      },
    })
    await eyes.check({
      settings: {
        name: 'layout viewport screenshot',
        fully: true,
        ignoreCaret: true,
        layoutRegions: ['#inner'],
        matchLevel: 'Strict',
      },
    })
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    assert.strictEqual(result.status, 'Passed')
  })

  for (const stitchMode of ['Scroll', 'CSS']) {
    it(`works inside an element with ${stitchMode} stitching`, async () => {
      const eyes = await core.openEyes({
        target: driver,
        settings: {
          serverUrl: 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY,
          appName: 'core classic',
          testName: 'coded region inside an element',
        },
      })
      await eyes.check({
        settings: {
          name: 'layout region screenshot',
          region: '#outer',
          fully: true,
          ignoreCaret: true,
          layoutRegions: ['#inner'],
          matchLevel: 'Strict',
          stitchMode,
        },
      })
      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
      const testInfo = await getTestInfo(result)
      assert.deepStrictEqual(testInfo.actualAppOutput[0].imageMatchSettings.layout, [
        {
          left: 1,
          top: 519,
          width: 200,
          height: 200,
          regionId: '#inner',
        },
      ])
    })
  }
})
