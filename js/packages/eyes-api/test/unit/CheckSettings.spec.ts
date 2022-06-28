import type * as types from '@applitools/types'
import {strict as assert} from 'assert'
import * as api from '../../src'

const makeSDK = require('../utils/fake-sdk')

describe('CheckSettings', () => {
  let sdk: types.Core<any, any, any> & {history: Record<string, any>[]; settings: Record<string, any>}

  class CheckSettings extends api.CheckSettings {
    protected static get _spec() {
      return sdk
    }
  }

  beforeEach(() => {
    sdk = makeSDK()
  })

  it('sets shadow selector with string', () => {
    const checkSettings = CheckSettings.shadow('el-with-shadow').region('el')
    assert.deepStrictEqual(checkSettings.toJSON(), {region: {selector: 'el-with-shadow', shadow: 'el'}})
  })

  it('sets shadow selector with framework selector', () => {
    const checkSettings = CheckSettings.shadow({fakeSelector: 'el-with-shadow'}).region({fakeSelector: 'el'})
    assert.deepStrictEqual(checkSettings.toJSON(), {
      region: {
        selector: {fakeSelector: 'el-with-shadow'},
        shadow: {fakeSelector: 'el'},
      },
    })
  })

  it('set waitBeforeCapture', () => {
    const checkSettings = new CheckSettings().waitBeforeCapture(1000)
    assert.equal(checkSettings.toJSON().waitBeforeCapture, 1000)
  })

  describe('lazyLoad', () => {
    it('set lazyLoad with options object', () => {
      const expected = {
        scrollLength: 1,
        waitingTime: 2,
        maxAmountToScroll: 3,
      }
      const checkSettings = new CheckSettings().lazyLoad(expected)
      const actual = checkSettings.toJSON().lazyLoad
      assert.deepStrictEqual(actual, expected)
    })
    it('set lazyLoad with no value', () => {
      const expected = true
      const checkSettings = new CheckSettings().lazyLoad()
      const actual = checkSettings.toJSON().lazyLoad
      assert.deepStrictEqual(actual, expected)
    })
  })
})
