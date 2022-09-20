import {makeCoreRequests} from '../../src/server/requests'
import nock from 'nock'
import assert from 'assert'

describe('requests', () => {
  beforeEach(() => {
    nock('https://localhost:3000').get('/api/sessions/renderinfo').query({apiKey: 'my0api0key'}).reply(200, {})
    nock('https://localhost:3000')
      .post('/api/sessions/running')
      .query({apiKey: 'my0api0key'})
      .reply((_url, body) => {
        return [
          201,
          {
            id: 'test-id',
            batchId: 'server-batch-id',
            baselineId: 'baseline-id',
            sessionId: 'session-id',
            url: JSON.stringify(body),
            isNew: true,
          },
        ]
      })
    nock('https://localhost:3000')
      .post('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key'})
      .reply((_url, body) => {
        return [
          200,
          {
            windowId: JSON.stringify(body),
            asExpected: true,
          },
        ]
      })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('openEyes', async () => {
    const requests = makeCoreRequests({agentId: 'test-core'})

    const {test} = await requests.openEyes({
      settings: {
        serverUrl: 'https://localhost:3000',
        apiKey: 'my0api0key',
        agentId: 'custom-agent',
        appName: 'My wonderful app',
        testName: 'Very important test',
        displayName: 'Public test name',
        userTestId: 'User specific test id',
        sessionType: 'SEQUENTIAL',
        properties: [{name: 'custom prop', value: 'custom value'}],
        batch: {
          id: 'batch-unique-id',
          name: 'batch name',
          sequenceName: 'sequence name',
          startedAt: new Date(1663055307397).toISOString(),
          notifyOnCompletion: true,
          properties: [{name: 'custom prop', value: 'custom value'}],
        },
        environmentName: 'My environment name',
        baselineEnvName: 'Baseline environment name',
        environment: {
          os: 'Linux',
          osInfo: 'Arch Linux',
          hostingApp: 'Chromium',
          hostingAppInfo: 'Chromium 105.0',
          deviceName: 'Desktop',
          viewportSize: {width: 100.25, height: 200.75},
          userAgent: 'UserAgent string',
        },
        branchName: 'Branch',
        parentBranchName: 'Parent branch',
        baselineBranchName: 'Baseline branch',
        compareWithParentBranch: false,
        ignoreBaseline: false,
        saveDiffs: false,
        abortIdleTestTimeout: 60_000,
      },
    })

    assert.deepStrictEqual(JSON.parse(test.resultsUrl), {
      startInfo: {
        agentId: 'test-core [custom-agent]',
        agentSessionId: 'User specific test id',
        agentRunId: 'User specific test id',
        sessionType: 'SEQUENTIAL',
        appIdOrName: 'My wonderful app',
        scenarioIdOrName: 'Very important test',
        displayName: 'Public test name',
        batchInfo: {
          id: 'batch-unique-id',
          name: 'batch name',
          batchSequenceName: 'sequence name',
          startedAt: '2022-09-13T07:48:27.397Z',
          notifyOnCompletion: true,
          properties: [{name: 'custom prop', value: 'custom value'}],
        },
        baselineEnvName: 'Baseline environment name',
        environmentName: 'My environment name',
        environment: {
          deviceInfo: 'Desktop',
          displaySize: {width: 100, height: 201},
          hostingApp: 'Chromium',
          hostingAppInfo: 'Chromium 105.0',
          inferred: 'useragent:UserAgent string',
          os: 'Linux',
          osInfo: 'Arch Linux',
        },
        branchName: 'Branch',
        parentBranchName: 'Parent branch',
        baselineBranchName: 'Baseline branch',
        compareWithParentBranch: false,
        ignoreBaseline: false,
        saveDiffs: false,
        properties: [{name: 'custom prop', value: 'custom value'}],
        timeout: 60000,
      },
    })
  })

  it('openEyes with rawEnvironment', async () => {
    const requests = makeCoreRequests({agentId: 'test-core'})

    const {test} = await requests.openEyes({
      settings: {
        serverUrl: 'https://localhost:3000',
        apiKey: 'my0api0key',
        environment: {
          os: 'Linux',
          osInfo: 'Arch Linux',
          hostingApp: 'Chromium',
          hostingAppInfo: 'Chromium 105.0',
          deviceName: 'Desktop',
          viewportSize: {width: 100.25, height: 200.75},
          userAgent: 'UserAgent string',
          rawEnvironment: {
            bla: 'lala',
            yada: 'yada yada',
          },
        },
      },
    })

    assert.deepStrictEqual(JSON.parse(test.resultsUrl), {
      startInfo: {
        agentId: 'test-core',
        environment: {
          bla: 'lala',
          yada: 'yada yada',
        },
      },
    })
  })

  it('check', async () => {
    const requests = makeCoreRequests({agentId: 'test-core'})

    const eyes = await requests.openEyes({
      settings: {
        serverUrl: 'https://localhost:3000',
        apiKey: 'my0api0key',
        agentId: 'custom-agent',
        appName: 'My wonderful app',
      },
    })

    const [result] = await eyes.check({
      target: {
        name: 'My beautiful image',
        source: 'https://localhost:8080/my-beautiful-page.html',
        image: 'https://localhost:3000/image.png',
        size: {width: 100.25, height: 200.75},
        dom: 'https://localhost:3000/dom.json',
        locationInViewport: {x: 10.25, y: 20.75},
        locationInView: {x: 11.25, y: 22.75},
        fullViewSize: {width: 1000.25, height: 2000.75},
      },
      settings: {
        name: 'First step',
        ignoreRegions: [
          {x: 10, y: 20, width: 11, height: 21},
          {region: {x: 10, y: 20, width: 11, height: 21}, regionId: 'ignore-region', padding: 3},
        ],
        layoutRegions: [
          {x: 50, y: 60, width: 51, height: 61},
          {region: {x: 50, y: 60, width: 51, height: 61}, regionId: 'layout-region', padding: {top: 3}},
        ],
        strictRegions: [
          {x: 80, y: 90, width: 81, height: 91},
          {region: {x: 80, y: 90, width: 81, height: 91}, regionId: 'strict-region', padding: {top: 3, left: 4}},
        ],
        contentRegions: [
          {x: 100, y: 110, width: 101, height: 111},
          {region: {x: 100, y: 110, width: 101, height: 111}, regionId: 'content-region', padding: {top: 3, left: 3, bottom: 2}},
        ],
        floatingRegions: [
          {x: 200, y: 210, width: 201, height: 211},
          {
            region: {x: 200, y: 210, width: 201, height: 211},
            regionId: 'floating-region',
            padding: {top: 3, left: 3, bottom: 2, right: 0},
            offset: {top: 2, left: 0, bottom: 5, right: 3},
          },
        ],
        accessibilityRegions: [
          {x: 300, y: 310, width: 301, height: 311},
          {
            region: {x: 300, y: 310, width: 301, height: 311},
            regionId: 'accessibility-region',
            padding: {top: 5, left: 8, bottom: 0, right: 3},
            type: 'LargeText',
          },
        ],
        accessibilitySettings: {
          level: 'AAA',
          version: 'WCAG_2_0',
        },
        matchLevel: 'Layout',
        useDom: true,
        enablePatterns: true,
        ignoreCaret: true,
        ignoreDisplacements: false,
        pageId: 'My page unique id',
      },
    })

    assert.deepStrictEqual(JSON.parse(result.windowId), {
      appOutput: {
        title: 'My beautiful image',
        screenshotUrl: 'https://localhost:3000/image.png',
        domUrl: 'https://localhost:3000/dom.json',
        location: {x: 10, y: 21},
        pageCoverageInfo: {
          pageId: 'My page unique id',
          width: 1000,
          height: 2001,
          imagePositionInPage: {x: 11, y: 23},
        },
      },
      options: {
        imageMatchSettings: {
          ignore: [
            {left: 7, top: 17, width: 17, height: 27, regionId: 'ignore-region'},
            {left: 10, top: 20, width: 11, height: 21},
          ],
          layout: [
            {left: 50, top: 57, width: 51, height: 64, regionId: 'layout-region'},
            {left: 50, top: 60, width: 51, height: 61},
          ],
          strict: [
            {left: 76, top: 87, width: 85, height: 94, regionId: 'strict-region'},
            {left: 80, top: 90, width: 81, height: 91},
          ],
          content: [
            {left: 97, top: 107, width: 104, height: 116, regionId: 'content-region'},
            {left: 100, top: 110, width: 101, height: 111},
          ],
          floating: [
            {
              left: 197,
              top: 207,
              width: 204,
              height: 216,
              regionId: 'floating-region',
              maxUpOffset: 2,
              maxDownOffset: 5,
              maxLeftOffset: 0,
              maxRightOffset: 3,
            },
            {left: 200, top: 210, width: 201, height: 211},
          ],
          accessibility: [
            {left: 292, top: 305, width: 312, height: 316, regionId: 'accessibility-region', type: 'LargeText'},
            {left: 300, top: 310, width: 301, height: 311},
          ],
          accessibilitySettings: {level: 'AAA', version: 'WCAG_2_0'},
          ignoreDisplacements: false,
          ignoreCaret: true,
          enablePatterns: true,
          matchLevel: 'Layout',
          useDom: true,
        },
        name: 'First step',
        source: 'https://localhost:8080/my-beautiful-page.html',
      },
    })
  })
})
