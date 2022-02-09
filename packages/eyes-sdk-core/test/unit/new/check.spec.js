'use strict'
const {expect} = require('chai')
const makeCheck = require('../../../lib/new/check')

function createEyesMock() {
  return {
    check: () => {},
    setCut(value) {
      this.cut = value
    },
    getCut() {
      return this.cut
    },
    _configuration: {
      mergeConfig: () => {},
    },
  }
}

describe('New eyes.check function', async () => {
  const cut = {top: 10, bottom: 0, left: 0, right: 0}

  it('cut value is used properly when the "cut" value is passed to eyes.check in "config"', async () => {
    const eyes = createEyesMock()
    const check = makeCheck({eyes})
    await check({config: {cut: cut}})
    const result = eyes.getCut()
    expect(result).to.eql(cut)
  })

  it('cut value is not overriden when setCut is called before eyes.check', async () => {
    const eyes = createEyesMock()
    eyes.setCut(cut)
    const check = makeCheck({eyes})
    await check()
    const result = eyes.getCut()
    expect(result).to.eql(cut)
  })
})
