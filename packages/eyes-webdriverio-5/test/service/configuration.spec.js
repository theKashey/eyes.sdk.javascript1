/* eslint-disable no-undef */
'use strict'

const {deepStrictEqual} = require('assert')

describe('EyesServiceTest', () => {
  beforeEach(async () => {
    await browser.url('http://applitools.github.io/demo/TestPages/FramesTestPage/')
  })

  it('checkWindow', async () => {
    const viewportSize = {width: 500, height: 400}
    const configuration = await browser.eyesGetConfiguration()
    configuration.setViewportSize(viewportSize)
    await browser.eyesSetConfiguration(configuration)

    await browser.eyesCheck('window')

    const actualViewportSize = (await browser.eyesGetConfiguration()).getViewportSize()

    deepStrictEqual(viewportSize, actualViewportSize.toJSON())
  })
})
