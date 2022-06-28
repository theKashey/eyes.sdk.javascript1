const assert = require('assert')
const mochaGrep = require('../src/mocha-grep')
const regexp = mochaGrep({
  tags: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari'],
})

describe('test filter', () => {
  it('works without tags', () => {
    assert(regexp.test('no tags'))
  })
  it('works for tests with a single tag', () => {
    assert(regexp.test('single tag (@webdriver)'))
  })
  it('works for tests with multiple tags', () => {
    assert(regexp.test('multiple tags (@safari @mobile @native)'))
  })
  it('works for tests with multiple tags, but not all tags match', () => {
    assert(!regexp.test('not allowed tag (@native-selectors @mobile @native)'))
  })
})
