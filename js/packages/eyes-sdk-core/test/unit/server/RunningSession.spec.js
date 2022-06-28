'use strict'

const assert = require('assert')

const {RunningSession} = require('../../../index')

describe('RunningSession', () => {
  it('constructor without arguments', () => {
    const rs = new RunningSession()

    assert.strictEqual(rs.getIsNew(), undefined)
    assert.strictEqual(rs.getId(), undefined)
    assert.strictEqual(rs.getUrl(), undefined)

    rs.setIsNew(true)
    rs.setUrl('dummy url')
    rs.setId('dummy id')

    assert.strictEqual(rs.getIsNew(), true)
    assert.strictEqual(rs.getId(), 'dummy id')
    assert.strictEqual(rs.getUrl(), 'dummy url')
  })
})
