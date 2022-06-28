'use strict'

const assert = require('assert')

const {MatchWindowData, AppOutput, Location, ImageMatchSettings, ImageMatchOptions} = require('../../../index')

describe('MatchWindowData', () => {
  let appOut_
  before(() => {
    appOut_ = new AppOutput({
      title: 'Dummy',
      screenshot: 'blob as base64',
      screenshotUrl: 'bla',
      imageLocation: new Location(20, 40),
    })
  })

  it('constructor without arguments', () => {
    const mwd = new MatchWindowData({appOutput: appOut_, tag: 'mytag'})
    const ims = new ImageMatchSettings()
    mwd._options = new ImageMatchOptions({userInputs: ims})
    assert.strictEqual(appOut_, mwd.getAppOutput())
    assert.strictEqual('mytag', mwd.getTag())
    assert.throws(() => new MatchWindowData({tag: 'tag'}))
  })
})
