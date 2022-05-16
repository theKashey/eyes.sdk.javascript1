import assert from 'assert'
import {makeLogger} from '@applitools/logger'
import * as utils from '@applitools/utils'
import {makeQueue} from '../../src/queue'

describe('queue', () => {
  const logger = makeLogger()

  it('starts task', async () => {
    const queue = makeQueue({logger})

    let isRun = false
    queue.run(async () => (isRun = true))

    assert.strictEqual(isRun, true)
  })

  it('doesnt start task if corked', async () => {
    const queue = makeQueue({logger})
    queue.cork()

    let isRun = false
    queue.run(async () => (isRun = true))

    assert.strictEqual(isRun, false)

    queue.uncork()

    assert.strictEqual(isRun, true)
  })

  it('passes abort signal to the task', async () => {
    const queue = makeQueue({logger})

    let isRun1 = false,
      isRun2 = false
    queue.run(async signal => {
      await utils.general.sleep(100)
      if (!signal.aborted) isRun1 = true
    })
    queue.run(async signal => {
      await utils.general.sleep(100)
      if (!signal.aborted) isRun2 = true
    })

    queue.cork()

    await utils.general.sleep(200)

    assert.strictEqual(isRun1, true)
    assert.strictEqual(isRun2, false)

    queue.uncork()

    await utils.general.sleep(200)

    assert.strictEqual(isRun1, true)
    assert.strictEqual(isRun2, true)
  })
})
