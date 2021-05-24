'use strict'
const {describe, it} = require('mocha')
const {expect} = require('chai')
const makeRenderingGridClient = require('../../src/sdk/renderingGridClient')
const createFakeWrapper = require('../util/createFakeWrapper')
const {apiKeyFailMsg} = require('../../src/sdk/wrapperUtils')

const apiKey = 'api key'
const appName = 'app name'

describe('renderingGridClient', () => {
  it('sets a new batch', async () => {
    const wrapper = createFakeWrapper('http://some_url')
    const {openEyes} = makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
      apiKey,
      appName,
      renderWrapper: wrapper,
    })

    await openEyes({wrappers: [wrapper]})

    const batchId = wrapper.getBatch().toJSON().id

    await openEyes({
      wrappers: [wrapper],
      apiKey,
    })

    const batchId2 = wrapper.getBatch().toJSON().id
    expect(batchId).to.equal(batchId2)
  })

  it('sets a new batch with properties', async () => {
    const wrapper = createFakeWrapper('http://some_url')
    const batchProperties = [
      {name: 'prop1', value: 'value1'},
      {name: 'prop2', value: 'value2'},
    ]
    const {openEyes} = makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
      apiKey,
      appName,
      renderWrapper: wrapper,
      batch: {
        name: 'batch name',
        properties: batchProperties,
      },
    })

    await openEyes({wrappers: [wrapper]})

    expect(wrapper.getBatch().toJSON().properties).to.eql(batchProperties)
  })

  it('validates presence of apiKey when openEyes and not at the creation of the client', async () => {
    const wrapper = createFakeWrapper('http://some_url')
    const {openEyes} = makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
      appName,
      renderWrapper: wrapper,
    })

    try {
      await openEyes({wrapper})
    } catch (err) {
      expect(err.message).to.equal(apiKeyFailMsg)
    }
  })

  it('getEmulatedDevicesSizes calls proper method on EyesWrapper', async () => {
    const wrapper = createFakeWrapper('http://some_url')
    const {getEmulatedDevicesSizes} = makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
      appName,
      renderWrapper: wrapper,
    })

    const result = await getEmulatedDevicesSizes()
    expect(result).to.eql(['emulated device 1', 'emulated device 2'])
  })

  it('getIosDevicesSizes calls proper method on EyesWrapper', async () => {
    const wrapper = createFakeWrapper('http://some_url')
    const {getIosDevicesSizes} = makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
      appName,
      renderWrapper: wrapper,
    })

    const result = await getIosDevicesSizes()
    expect(result).to.eql(['ios device 1', 'ios device 2'])
  })

  it('handles ignoreGitMergeBase', async () => {
    const wrapper = createFakeWrapper('http://some_url')
    expect(wrapper.getIgnoreGitMergeBase()).to.be.undefined
    const {openEyes} = makeRenderingGridClient({
      apiKey,
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
      appName,
      renderWrapper: wrapper,
      ignoreGitMergeBase: true,
    })
    await openEyes({wrappers: [wrapper]})
    expect(wrapper.getIgnoreGitMergeBase()).to.be.true
  })
})
