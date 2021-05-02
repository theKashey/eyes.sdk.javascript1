'use strict';

const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const puppeteer = require('puppeteer');
const makeInitPage = require('../../src/initPage');
const logger = require('../util/testLogger');

describe('init page', () => {
  let browser;

  before(async () => {
    browser = await puppeteer.launch();
  });

  after(async () => {
    browser.close();
  });

  it('set configurations', async () => {
    const iframeUrl = 'about:blank';
    const config = {
      viewportSize: {width: 400, height: 600},
    };

    const initPage = makeInitPage({iframeUrl, config, browser, logger, getRenderIE: () => false});

    const page = await initPage({pageId: 0});

    expect(page.viewport()).to.eql(config.viewportSize);
    expect(page.url()).to.eql(iframeUrl);
  });

  it('handles page error by removing errored page from page pool and replacing it with newly created page', async () => {
    const initPage = makeInitPage({
      iframeUrl: 'about:blank',
      config: {},
      browser,
      logger,
      getRenderIE: () => false,
    });
    let counter = 0;
    const pagePool = {
      pages: [],
      removePage(id) {
        this.pages.splice(
          this.pages.findIndex(x => x === id),
          1,
        );
      },
      async createPage() {
        return {pageId: counter++};
      },
      addToPool(id) {
        this.pages.push(id);
      },
    };
    const page = await initPage({pageId: counter, pagePool});
    pagePool.addToPool(++counter);
    page.emit('error', new Error('bla'));
    await new Promise(r => setTimeout(r, 200)); // TODO yuck! but I just didn't have time and energy to invest in wiring the promise-based pagePool with the event-based browser
    expect(pagePool.pages).to.eql([1]);
  });
});
