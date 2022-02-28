const assert = require('assert')
const {abort} = require('../../src/universal-server-eyes-commands')
const {makeRefer} = require('../../dist/refer')

describe('eyes commands', async () => {
  it('abort return correct value when eyes is a valid ref', async () => {
    const refer = makeRefer()
    const eyes = refer.ref({abort: async () => 'blah'})
    assert.strictEqual(await abort({eyes, refer}), 'blah')
  })
  it('abort fails gracefully when eyes is an invalid ref', async () => {
    const refer = makeRefer()
    const eyes = refer.ref({abort: async () => true})
    refer.destroy(eyes)
    await assert.doesNotReject(() => abort({eyes, refer}))
  })
})
