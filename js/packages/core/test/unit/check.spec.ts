import {makeFakeCore} from '../utils/fake-base-core'
import {makeCheck} from '../../src/check'
import assert from 'assert'

describe('check', () => {
  it('should calculate default value for sendDom using other settings', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        check({settings}) {
          assert.strictEqual(settings.sendDom, true)
        },
      },
    })
    const fakeEyes = await fakeCore.openEyes({settings: {serverUrl: '', apiKey: '', appName: '', testName: ''}})

    const check = makeCheck({eyes: fakeEyes})

    await check({settings: {enablePatterns: true}})
    await check({settings: {useDom: true}})
    await check({settings: {matchLevel: 'Layout'}})
    await assert.rejects(check())
    await assert.rejects(check({settings: {sendDom: false}}))
  })

  it('should set true as a default value for sendDom if rca is enabled', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        check({settings}) {
          assert.strictEqual(settings.sendDom, true)
        },
      },
      account: {rcaEnabled: true},
    })
    const fakeEyes = await fakeCore.openEyes({settings: {serverUrl: '', apiKey: '', appName: '', testName: ''}})

    const check = makeCheck({eyes: fakeEyes})

    await check()
    await check({settings: {enablePatterns: false}})
    await check({settings: {useDom: false}})
    await check({settings: {matchLevel: 'Strict'}})
    await assert.rejects(check({settings: {sendDom: false}}))
  })
})
