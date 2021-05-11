// https://trello.com/c/FGmYqjCo
const path = require('path')
const cwd = process.cwd()
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {testSetup} = require('../..')

describe.skip('baselineBranchName', () => {
  let driver, destroy, eyes
  before(async () => {
    ;[driver, destroy] = await spec.build({browser: 'chrome'})
    eyes = testSetup.getEyes({vg: true})
  })
  after(async () => {
    await destroy()
    await eyes.abortIfNotClosed()
  })
  it('works', async () => {
    await spec.visit(driver, 'https://applitools.com/helloworld')
    eyes.setBaselineBranchName('branchDoesntExist')
    await eyes.open(driver, 'baseline branch name', 'works')
    await eyes.checkWindow({})
    await eyes.close()
  })
})
