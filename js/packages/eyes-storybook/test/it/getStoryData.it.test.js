const puppeteer = require('puppeteer');
const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const {testServerInProcess} = require('@applitools/test-server');
const makeGetStoryData = require('../../src/getStoryData');
const {ptimeoutWithError} = require('@applitools/functional-commons');
const browserLog = require('../../src/browserLog');
const logger = require('../util/testLogger');
const {deserializeDomSnapshotResult} = require('@applitools/eyes-sdk-core');

describe('getStoryData', () => {
  let browser, page, closeTestServer;
  before(async () => {
    browser = await puppeteer.launch({headless: true});
    page = await browser.newPage();
    const server = await testServerInProcess({port: 7272});
    closeTestServer = server.close;
    browserLog({page, onLog: text => console.log(`[browser] ${text}`)});
  });

  after(async () => {
    await browser.close();
    await closeTestServer();
  });

  it('works with waitBeforeCapture as a number', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: ['url1', await page.evaluate('window.timeout')],
        blobs: [{url: 'url2', type: 'type', value: 'ss'}],
        cdt: 'cdt',
        frames: [],
      }),
    ];

    const getStoryData = makeGetStoryData({
      logger,
      takeDomSnapshots,
      waitBeforeCapture: 2000,
    });

    const getStoryPromise = getStoryData({
      story: {},
      storyUrl: 'http://localhost:7272/renderTimeoutNumber.html',
      page,
    });
    const [{resourceUrls, resourceContents, cdt}] = await ptimeoutWithError(
      getStoryPromise,
      3000,
      'timeout',
    );

    expect(resourceUrls).to.eql(['url1', 1500]);
    expect(resourceContents).to.eql({
      url2: {url: 'url2', type: 'type', value: Buffer.from('ss', 'base64')},
    });
    expect(cdt).to.equal('cdt');
  });

  it('works with waitBeforeCapture as a css selector', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [
          'url1',
          await page.evaluate(
            "document.getElementById('newDiv') && document.getElementById('newDiv').innerText",
          ),
        ],
        blobs: [{url: 'url2', type: 'type', value: 'ss'}],
        cdt: 'cdt',
        frames: [],
      }),
    ];

    const getStoryData = makeGetStoryData({
      logger,
      takeDomSnapshots,
      waitBeforeCapture: '#newDiv',
    });

    const getStoryPromise = getStoryData({
      story: {},
      storyUrl: 'http://localhost:7272/renderTimeoutSelector.html',
      page,
    });
    const [{resourceUrls, resourceContents, cdt}] = await ptimeoutWithError(
      getStoryPromise,
      3000,
      'timeout',
    );

    expect(resourceUrls).to.eql(['url1', 'div created']);
    expect(resourceContents).to.eql({
      url2: {url: 'url2', type: 'type', value: Buffer.from('ss', 'base64')},
    });
    expect(cdt).to.equal('cdt');
  });

  it('works with waitBeforeCapture as a function', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [
          'url1',
          await page.evaluate("document.getElementById('changeME').innerText"),
        ],
        blobs: [{url: 'url2', type: 'type', value: 'ss'}],
        cdt: 'cdt',
        frames: [],
      }),
    ];

    const getStoryData = makeGetStoryData({
      logger,
      takeDomSnapshots,
      // eslint-disable-next-line no-undef
      waitBeforeCapture: () => window.ready === 'ok',
    });

    const getStoryPromise = getStoryData({
      story: {},
      storyUrl: 'http://localhost:7272/renderTimeoutFunction.html',
      page,
    });
    const [{resourceUrls, resourceContents, cdt}] = await ptimeoutWithError(
      getStoryPromise,
      3000,
      'timeout',
    );

    expect(resourceUrls).to.eql(['url1', '1500 ms passed']);
    expect(resourceContents).to.eql({
      url2: {url: 'url2', type: 'type', value: Buffer.from('ss', 'base64')},
    });
    expect(cdt).to.equal('cdt');
  });

  it('uses storybook client API V5 when possible', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('story').textContent"),
        frames: [],
      }),
    ];

    await page.goto('http://localhost:7272/renderStorybookClientApiV5_2-iframe.html');
    const getStoryData = makeGetStoryData({logger, takeDomSnapshots});

    expect((await getStoryData({story: {isApi: true, index: 0}, page}))[0].cdt).to.equal('story1');
    expect((await getStoryData({story: {isApi: true, index: 1}, page}))[0].cdt).to.equal('story2');
  });

  // TODO: ask about this -- duplicate, no? the URL is slightly different
  it('uses storybook client API V5 when possible', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('story').textContent"),
        frames: [],
      }),
    ];

    await page.goto('http://localhost:7272/renderStorybookClientApiV5-iframe.html');
    const getStoryData = makeGetStoryData({logger, takeDomSnapshots});

    expect((await getStoryData({story: {isApi: true, index: 0}, page}))[0].cdt).to.equal('story1');
    expect((await getStoryData({story: {isApi: true, index: 1}, page}))[0].cdt).to.equal('story2');
  });

  it('uses storybook client API V4 when possible', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('story').textContent"),
        frames: [],
      }),
    ];

    await page.goto('http://localhost:7272/renderStorybookClientApiV4-iframe.html');
    const getStoryData = makeGetStoryData({logger, takeDomSnapshots});

    expect((await getStoryData({story: {isApi: true, index: 0}, page}))[0].cdt).to.equal(
      'Button-With text',
    );
  });

  it('runs runBefore before extracting story data V5', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('root').textContent"),
        frames: [],
      }),
    ];

    await page.goto('http://localhost:7272/runBeforeV5-iframe.html');
    const getStoryData = makeGetStoryData({logger, takeDomSnapshots});

    const [{cdt}] = await getStoryData({
      story: {
        isApi: true,
        index: 0,
        parameters: {
          eyes: {
            runBefore: {},
          },
        },
      },
      page,
    });

    expect(cdt).to.equal('story done');
  });

  it('runs runBefore before extracting story data V4', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('root').textContent"),
        frames: [],
      }),
    ];

    await page.goto('http://localhost:7272/runBeforeV4-iframe.html');
    const getStoryData = makeGetStoryData({logger, takeDomSnapshots});

    const [{cdt}] = await getStoryData({
      story: {
        isApi: true,
        index: 0,
        parameters: {
          eyes: {
            runBefore: {},
          },
        },
      },
      page,
    });

    expect(cdt).to.equal('story done');
  });

  it("doesn't throw on exception in runBefore", async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('root').textContent"),
        frames: [],
      }),
    ];

    await page.goto('http://localhost:7272/runBeforeWithException-iframe.html');
    const getStoryData = makeGetStoryData({logger, takeDomSnapshots});

    const [{cdt}] = await getStoryData({
      story: {isApi: true, index: 0, parameters: {eyes: {runBefore: {}}}},
      page,
    });

    expect(cdt).to.equal('story done');
  });

  it('reloads page when reloadPagePerStory is set', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('root').textContent"),
        frames: [],
      }),
    ];

    const storyUrl = 'http://localhost:7272/reloadPagePerStory.html';

    await page.goto(storyUrl);
    const getStoryData = makeGetStoryData({
      logger,
      takeDomSnapshots,
      reloadPagePerStory: true,
    });

    const [{cdt}] = await getStoryData({
      story: {isApi: true, index: 0},
      storyUrl,
      page,
    });

    expect(cdt).to.equal('fresh content');
  });

  it('reloads page when required query parameters are different than current', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('root').textContent"),
        frames: [],
      }),
    ];

    const storyUrl = 'http://localhost:7272/reloadPagePerStory.html';

    await page.goto(`${storyUrl}?eyes-query-params=them,lang&them=dark&lang=en`);
    const getStoryData = makeGetStoryData({
      logger,
      takeDomSnapshots,
    });

    const [{cdt}] = await getStoryData({
      story: {isApi: true, index: 0, parameters: {eyes: {queryParams: {theme: 'dark'}}}},
      storyUrl: `${storyUrl}?eyes-query-params=them&them=dark`,
      page,
    });

    expect(cdt).to.equal('fresh content');
  });

  it('does not reload page when no query parameters required', async () => {
    const takeDomSnapshots = async () => [
      deserializeDomSnapshotResult({
        resourceUrls: [],
        blobs: [],
        cdt: await page.evaluate("document.getElementById('root').textContent"),
        frames: [],
      }),
    ];

    const storyUrl = 'http://localhost:7272/reloadPagePerStory.html';

    await page.goto(`${storyUrl}?unknownQueryParam=bla`);
    const getStoryData = makeGetStoryData({
      logger,
      takeDomSnapshots,
    });

    const [{cdt}] = await getStoryData({
      story: {isApi: true, index: 0},
      storyUrl,
      page,
    });

    expect(cdt).to.equal('stale content');
  });
});
