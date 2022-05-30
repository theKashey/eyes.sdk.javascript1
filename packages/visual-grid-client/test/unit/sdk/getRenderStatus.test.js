'use strict'
const {describe, it, beforeEach} = require('mocha')
const {expect} = require('chai')
const makeGetRenderStatus = require('../../../src/sdk/getRenderStatus')
const {RenderStatusResults} = require('@applitools/eyes-sdk-core')
const testLogger = require('../../util/testLogger')
const psetTimeout = require('util').promisify(setTimeout)
const {presult} = require('@applitools/functional-commons')

describe('getRenderStatus', () => {
  let calls
  let getRenderStatus

  beforeEach(() => {
    calls = []
    getRenderStatus = makeGetRenderStatus({
      logger: testLogger,
      doGetRenderStatus,
      getStatusInterval: 50,
    })
  })

  async function doGetRenderStatus(renderIds) {
    calls.push(renderIds)
    await psetTimeout(100)
    if (renderIds.includes('error')) {
      throw new Error('fail')
    } else {
      return renderIds.map(
        renderId =>
          new RenderStatusResults({status: renderId === 'undefined' ? undefined : renderId}),
      )
    }
  }

  it('works for single render', async () => {
    const renderId = 'bla'
    const status = await getRenderStatus(renderId)
    expect(status).to.eql(new RenderStatusResults({status: renderId}))
    expect(calls).to.eql([['bla']])
  })

  it('batches renders together in the first 100ms', async () => {
    const renderId1 = 'bla1'
    const renderId2 = 'bla2'
    const promise1 = getRenderStatus(renderId1)
    const promise2 = getRenderStatus(renderId2)
    let flag = false
    psetTimeout(50).then(() => (flag = true))

    const rs1 = await promise1
    const rs2 = await promise2
    expect(flag).to.be.true
    expect(rs1).to.eql(new RenderStatusResults({status: renderId1}))
    expect(rs2).to.eql(new RenderStatusResults({status: renderId2}))
    expect(calls).to.eql([['bla1', 'bla2']])
  })

  it('runs again if there are pending calls', async () => {
    const renderId1 = 'bla1'
    const promise1 = getRenderStatus(renderId1)

    await psetTimeout(150) // after initial wait of 100ms and in the middle of 100ms of doGetRenderStatus

    const renderId2 = 'bla2'
    const renderId3 = 'bla3'
    const promise2 = getRenderStatus(renderId2)
    const promise3 = getRenderStatus(renderId3)

    const rs1 = await promise1
    const rs2 = await promise2
    const rs3 = await promise3

    expect(rs1).to.eql(new RenderStatusResults({status: renderId1}))
    expect(rs2).to.eql(new RenderStatusResults({status: renderId2}))
    expect(rs3).to.eql(new RenderStatusResults({status: renderId3}))
    expect(calls).to.eql([[renderId1], [renderId2, renderId3]])
  })

  it('rejects renders when doGetRendered threw exception', async () => {
    const renderId1 = 'bla1'
    const renderId2 = 'error'
    const promise1 = getRenderStatus(renderId1)
    const promise2 = getRenderStatus(renderId2)

    const [err1, _rs1] = await presult(promise1)
    const [err2, _rs2] = await presult(promise2)
    expect(err1).to.be.an.instanceOf(Error)
    expect(err1.message).to.equal('fail')
    expect(err2).to.be.an.instanceOf(Error)
    expect(err2.message).to.equal('fail')
    expect(calls).to.eql([['bla1', 'error']])
  })

  it('continues to run after an error happens', async () => {
    const renderId1 = 'bla1'
    const renderId2 = 'error'
    const promise1 = presult(getRenderStatus(renderId1))
    const promise2 = presult(getRenderStatus(renderId2))

    await psetTimeout(150)

    const renderId3 = 'bla3'
    const promise3 = await getRenderStatus(renderId3)

    const [err1, _rs1] = await promise1
    const [err2, _rs2] = await promise2
    const rs3 = await promise3

    expect(err1).to.be.an.instanceOf(Error)
    expect(err1.message).to.equal('fail')
    expect(err2).to.be.an.instanceOf(Error)
    expect(err2.message).to.equal('fail')
    expect(calls).to.eql([['bla1', 'error'], ['bla3']])
    expect(rs3).to.eql(new RenderStatusResults({status: renderId3}))
  })

  it('handles undefined render status', async () => {
    const renderId1 = 'bla1'
    const renderId2 = undefined
    const promise1 = getRenderStatus(renderId1)
    const promise2 = getRenderStatus(renderId2)

    await psetTimeout(150)

    const rs1 = await promise1
    const rs2 = await promise2

    expect(rs1).to.eql(new RenderStatusResults({status: renderId1}))
    expect(rs2).to.eql(new RenderStatusResults())
    expect(calls).to.eql([['bla1', 'undefined']]) // 'undefined' and not undefined because when undefined becomes a key in pendingRenders it is transformed to 'undefined'
  })
})
