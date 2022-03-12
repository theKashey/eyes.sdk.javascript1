const createResource = require('../../../src/sdk/resources/createResource')
const assert = require('assert')

describe('createResource', () => {
  it('dont trim CDT', async () => {
    const LENGTH = 36000000
    const value = Buffer.alloc(LENGTH)
    const r1 = new createResource({value, contentType: 'x-applitools-html/cdt'})

    assert.equal(r1.value.length, LENGTH)
  })
})
