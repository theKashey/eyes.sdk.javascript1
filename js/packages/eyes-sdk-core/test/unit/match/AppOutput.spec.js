'use strict'

const assert = require('assert')

const {AppOutput, Location} = require('../../../index')

describe('AppOutput', () => {
  it('constructor without arguments', () => {
    const pageCoverageInfo = {
      pageId: 'my-page',
      width: 800,
      height: 1200,
      imagePositionInPage: {x: 10, y: 20},
    }
    const ao = new AppOutput({
      title: 'title',
      imageLocation: new Location(10, 30),
      screenshot: 'some fake base64 screenshot serialized',
      screenshotUrl: 'abc',
      pageCoverageInfo,
    })
    assert.strictEqual('title', ao.getTitle())
    assert.deepStrictEqual(new Location(10, 30), ao.getImageLocation())
    assert.strictEqual('some fake base64 screenshot serialized', ao.getScreenshot64())
    assert.strictEqual('abc', ao.getScreenshotUrl())
    assert.deepStrictEqual(ao.getPageCoverageInfo(), pageCoverageInfo)
  })
})
