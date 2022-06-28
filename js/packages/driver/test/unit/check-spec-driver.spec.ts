import assert from 'assert'
import {MockDriver, spec} from '../../src/fake'
import {checkSpecDriver} from '../../src/debug'

describe.skip('check spec driver', () => {
  it('works', async () => {
    const driver = new MockDriver()
    const results = await checkSpecDriver({spec, driver})

    results.forEach(result => {
      console.log(result)
      assert.ok(!result.error, result.error)
    })
  })
})
