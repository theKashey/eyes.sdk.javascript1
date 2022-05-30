'use strict'
const assert = require('assert')
const {ArgumentGuard} = require('../../../index')

describe('ArgumentGuard', () => {
  describe('isBoolean()', () => {
    it('should be ok, boolean given', () => {
      assert.doesNotThrow(() => {
        ArgumentGuard.isBoolean(true, 'testparam')
      })
    })

    it('should throw error, string given', () => {
      assert.throws(() => {
        ArgumentGuard.isBoolean('NOT A BOOLEAN', 'testparam')
      })
    })

    it('should be ok too, no value given in non-strict mode', () => {
      assert.doesNotThrow(() => {
        ArgumentGuard.isBoolean(undefined, 'testparam', false)
      })
    })

    it('should throw error, no value given in strict mode (default behaviour)', () => {
      assert.throws(() => {
        ArgumentGuard.isBoolean(undefined, 'testparam')
      })
    })
  })

  describe('isPlainObject()', () => {
    it('works', () => {
      assert.doesNotThrow(() => {
        ArgumentGuard.isPlainObject({}, 'some-name')
      })
      assert.doesNotThrow(() => {
        ArgumentGuard.isPlainObject({a: true}, 'some-name')
      })
      assert.doesNotThrow(() => {
        ArgumentGuard.isPlainObject(new Object(), 'some-name')
      })
      assert.throws(() => {
        ArgumentGuard.isPlainObject('Not an object', 'some-name')
      })
      assert.throws(() => {
        ArgumentGuard.isPlainObject(undefined, 'some-name')
      })
      assert.throws(() => {
        ArgumentGuard.isPlainObject(null, 'some-name')
      })
      assert.throws(() => {
        ArgumentGuard.isPlainObject([], 'some-name')
      })
    })

    it('works with strict false', () => {
      assert.doesNotThrow(() => {
        ArgumentGuard.isPlainObject(undefined, 'some-name', false)
      })
      assert.doesNotThrow(() => {
        ArgumentGuard.isPlainObject(null, 'some-name', false)
      })
    })
  })
})
