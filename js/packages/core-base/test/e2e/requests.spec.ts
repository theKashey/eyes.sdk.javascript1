import assert from 'assert'
import {readFile} from 'fs/promises'
import {getTestInfo} from '@applitools/test-utils'
import {makeCoreRequests, type CoreRequests} from '../../src/server/requests'

describe('requests', () => {
  let core: CoreRequests

  before(() => {
    core = makeCoreRequests({agentId: 'core-base/test'})
  })

  it('works with basic flow', async () => {
    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        appName: 'Test App',
        testName: 'Test',
        environment: {
          os: 'Platform',
          hostingApp: 'TestBrowser',
          deviceName: 'Machine',
          viewportSize: {width: 210, height: 700},
        },
      },
    })

    await eyes.check({
      target: {
        image: await readFile('./test/fixtures/screenshot.png'),
      },
      settings: {
        ignoreRegions: [{x: 0, y: 0, width: 100, height: 100}],
        layoutRegions: [{x: 100, y: 100, width: 100, height: 100}],
        contentRegions: [{region: {x: 200, y: 200, width: 100, height: 100}}],
        strictRegions: [{region: {x: 300, y: 300, width: 100, height: 100}, regionId: 'my-id'}],
        floatingRegions: [{region: {x: 400, y: 400, width: 100, height: 100}, offset: {top: 10, left: 20}}],
        accessibilityRegions: [{region: {x: 500, y: 500, width: 100, height: 100}, type: 'BoldText'}],
      },
    })

    const [result] = await eyes.close()
    const info = await getTestInfo(result)
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.ignore, [{left: 0, top: 0, width: 100, height: 100}])
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.layout, [{left: 100, top: 100, width: 100, height: 100}])
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.content, [{left: 200, top: 200, width: 100, height: 100}])
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.strict, [
      {left: 300, top: 300, width: 100, height: 100, regionId: 'my-id'},
    ])
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.floating, [
      {left: 400, top: 400, width: 100, height: 100, maxLeftOffset: 20, maxRightOffset: 0, maxUpOffset: 10, maxDownOffset: 0},
    ])
    assert.deepStrictEqual(info.actualAppOutput[0].imageMatchSettings.accessibility, [
      {left: 500, top: 500, width: 100, height: 100, type: 'BoldText', isDisabled: false},
    ])
  })
})
