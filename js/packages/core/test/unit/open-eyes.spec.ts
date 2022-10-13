import {makeFakeCore} from '../utils/fake-base-core'
import {makeOpenEyes} from '../../src/open-eyes'
import assert from 'assert'

describe('open-eyes', () => {
  it('should populate settings from environment variables', async () => {
    const originalEnv = process.env
    try {
      const fakeCore = makeFakeCore({
        hooks: {
          openEyes({settings}) {
            assert.strictEqual(settings.serverUrl, process.env.APPLITOOLS_SERVER_URL)
            assert.strictEqual(settings.apiKey, process.env.APPLITOOLS_API_KEY)
            assert.strictEqual(settings.batch.id, process.env.APPLITOOLS_BATCH_ID)
            assert.strictEqual(settings.batch.name, process.env.APPLITOOLS_BATCH_NAME)
            assert.strictEqual(settings.batch.sequenceName, process.env.APPLITOOLS_BATCH_SEQUENCE)
            assert.strictEqual(settings.batch.notifyOnCompletion, process.env.APPLITOOLS_BATCH_NOTIFY === 'true')
            assert.strictEqual(settings.keepBatchOpen, process.env.APPLITOOLS_DONT_CLOSE_BATCHES === '1')
            assert.strictEqual(settings.branchName, process.env.APPLITOOLS_BRANCH)
            assert.strictEqual(settings.parentBranchName, process.env.APPLITOOLS_PARENT_BRANCH)
            assert.strictEqual(settings.baselineBranchName, process.env.APPLITOOLS_BASELINE_BRANCH)
          },
        },
      })
      const openEyes = makeOpenEyes({core: fakeCore})

      process.env = {
        APPLITOOLS_SERVER_URL: 'server-url',
        APPLITOOLS_API_KEY: 'api-key',
        APPLITOOLS_BATCH_ID: 'batch-id',
        APPLITOOLS_BATCH_NAME: 'batch-name',
        APPLITOOLS_BATCH_SEQUENCE: 'batch-sequence-name',
        APPLITOOLS_BATCH_NOTIFY: 'true',
        APPLITOOLS_DONT_CLOSE_BATCHES: '1',
        APPLITOOLS_BRANCH: 'branch-name',
        APPLITOOLS_PARENT_BRANCH: 'parent-branch-name',
        APPLITOOLS_BASELINE_BRANCH: 'baseline-branch-name',
      }

      await openEyes({type: 'classic'})
    } finally {
      process.env = originalEnv
    }
  })

  it('should populate userTestId', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        openEyes({settings}) {
          const [testName, _random] = settings.userTestId.split('--')
          assert.strictEqual(testName, settings.testName)
        },
      },
    })
    const openEyes = makeOpenEyes({core: fakeCore})

    await openEyes({type: 'classic', settings: {testName: 'test-name'}})
  })
})
