const assert = require('assert')
const makeSDK = require('../utils/fake-sdk')
const api = require('../../dist')

describe('CheckSettings', () => {
  let sdk
  class CheckSettings extends api.CheckSettings {}

  beforeEach(() => {
    sdk = makeSDK()
    CheckSettings._spec = sdk
  })

  it('sets shadow selector with string', () => {
    const checkSettings = CheckSettings.shadow('el-with-shadow').region('el')
    assert.deepStrictEqual(checkSettings._settings, {region: {selector: 'el-with-shadow', shadow: 'el'}})
  })

  it('sets shadow selector with string', () => {
    debugger
    const checkSettings = CheckSettings.shadow({fakeSelector: 'el-with-shadow'}).region({fakeSelector: 'el'})
    assert.deepStrictEqual(checkSettings._settings, {
      region: {
        selector: {fakeSelector: 'el-with-shadow'},
        shadow: {fakeSelector: 'el'},
      },
    })
  })
})
