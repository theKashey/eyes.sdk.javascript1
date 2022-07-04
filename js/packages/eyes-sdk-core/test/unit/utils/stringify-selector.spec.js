const stringifySelector = require('../../../lib/utils/stringify-selector')
const assert = require('assert')

describe('stringify-selector', () => {
  it('skips incomplete input', () => {
    assert.deepStrictEqual(stringifySelector(), undefined)
    assert.deepStrictEqual(stringifySelector({commonSelector: {}}), undefined)
  })
  it('returns type prefix', () => {
    const fakeElement = {
      commonSelector: {selector: '.blah', type: 'css'},
    }
    assert.deepStrictEqual(stringifySelector(fakeElement), '.blah')
  })
})
