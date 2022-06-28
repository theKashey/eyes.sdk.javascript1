'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')
const transactionThroat = require('../../../src/sdk/transactionThroat')
const psetTimeout = require('util').promisify(setTimeout)

describe('transactionThroat', () => {
  it('works for concurrency=1', async () => {
    let counter = 0
    const increment = () => counter++
    const waitAndIncrementAndExpect = expected => async () => {
      await psetTimeout(50)
      counter++
      expect(counter).to.equal(expected)
    }
    const testTransactionThroat = transactionThroat(1)
    const {promise: promise1, resolve: resolve1} = testTransactionThroat(increment)
    const {promise: promise2, resolve: resolve2} = testTransactionThroat(increment)

    promise1.then(waitAndIncrementAndExpect(3))
    promise2.then(waitAndIncrementAndExpect(4))

    expect(counter).to.equal(1)

    resolve1()
    await psetTimeout(0)
    expect(counter).to.equal(2)
    await psetTimeout(100)
    expect(counter).to.equal(3)

    resolve2()
    expect(counter).to.equal(3)
    await psetTimeout(100)
    expect(counter).to.equal(4)
  })

  it('works for concurrency=2', async () => {
    let counter = 0
    const increment = () => counter++
    const waitAndIncrementAndExpect = expected => async () => {
      await psetTimeout(50)
      counter++
      expect(counter).to.equal(expected)
    }
    const testTransactionThroat = transactionThroat(2)
    const {promise: promise1, resolve: resolve1} = testTransactionThroat(increment)
    const {promise: promise2, resolve: resolve2} = testTransactionThroat(increment)
    const {promise: promise3, resolve: resolve3} = testTransactionThroat(increment)
    const {promise: promise4, resolve: resolve4} = testTransactionThroat(increment)
    const {promise: promise5, resolve: resolve5} = testTransactionThroat(increment)

    promise1.then(waitAndIncrementAndExpect(4))
    promise2.then(waitAndIncrementAndExpect(6))
    promise3.then(waitAndIncrementAndExpect(8))
    promise4.then(waitAndIncrementAndExpect(9))
    promise5.then(waitAndIncrementAndExpect(10))

    expect(counter).to.equal(2)

    resolve1()
    await psetTimeout(0)
    expect(counter).to.equal(3)
    await psetTimeout(100)
    expect(counter).to.equal(4)

    resolve2()
    await psetTimeout(0)
    expect(counter).to.equal(5)
    await psetTimeout(100)
    expect(counter).to.equal(6)

    resolve3()
    await psetTimeout(0)
    expect(counter).to.equal(7)
    await psetTimeout(100)
    expect(counter).to.equal(8)

    resolve4()
    expect(counter).to.equal(8)
    await psetTimeout(100)
    expect(counter).to.equal(9)

    resolve5()
    expect(counter).to.equal(9)
    await psetTimeout(100)
    expect(counter).to.equal(10)
  })
})
