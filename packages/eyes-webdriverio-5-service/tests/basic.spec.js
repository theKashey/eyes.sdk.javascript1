/* global browser */

const {Target} = require('../index')

describe('EyesServiceTest', () => {
  it('checkWindow', async () => {
    await browser.url('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
    await browser.eyesCheck('', Target.window())
  })
})
