import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import assert from 'assert'

describe('open-eyes', () => {
  it('handles error during requesting account info', async () => {
    it('throws error if render failed', async () => {
      const fakeClient = makeFakeClient()
      const fakeCore = makeFakeCore({
        hooks: {
          getAccountInfo: () => {
            throw new Error('get account info failed')
          },
        },
      })
      const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})

      await assert.rejects(
        core.openEyes({
          settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
        }),
        error => error.message === 'get account info failed',
      )
    })
  })
})
