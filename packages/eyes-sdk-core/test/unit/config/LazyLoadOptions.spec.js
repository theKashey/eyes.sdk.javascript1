const assert = require('assert')
const makeLazyLoadOptions = require('../../../lib/config/LazyLoadOptions')

describe('makeLazyLoadOptions', () => {
  const defaultOptions = {
    scrollLength: 300,
    waitingTime: 2000,
    maxAmountToScroll: 15000,
  }

  it('makeLazyLoadOptions()', () => {
    assert.deepStrictEqual(makeLazyLoadOptions(), undefined)
  })

  it('makeLazyLoadOptions(bool)', () => {
    assert.deepStrictEqual(makeLazyLoadOptions(true), defaultOptions)
  })

  it('makeLazyLoadOptions(obj)', () => {
    const input = {
      scrollLength: 1,
      waitingTime: 2,
      maxAmountToScroll: 3,
    }
    assert.deepStrictEqual(makeLazyLoadOptions(input), input)
  })

  it('makeLazyLoadOptions(partial obj)', () => {
    const input = {
      scrollLength: 1,
      waitingTime: 2,
    }
    const expected = {
      scrollLength: 1,
      waitingTime: 2,
      maxAmountToScroll: 15000,
    }
    assert.deepStrictEqual(makeLazyLoadOptions(input), expected)
  })

  it('makeLazyLoadOptions({})', () => {
    assert.deepStrictEqual(makeLazyLoadOptions({}), defaultOptions)
  })

  it('makeLazyLoadOptions(invalid)', () => {
    assert.doesNotThrow(() => makeLazyLoadOptions(), /Invalid type provided/)
    assert.throws(() => makeLazyLoadOptions(2), /Invalid type provided/)
  })
})
