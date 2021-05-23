// re: https://trello.com/c/IRsmmbK5
const cwd = process.cwd()
const path = require('path')
const {setupEyes} = require('@applitools/test-utils')
const spec = require(path.resolve(cwd, 'dist/spec-driver'))
const {By, Target} = require(cwd)

// unable to get Edge Classic from Sauce, skipping until resolved
describe.skip('Coverage Tests', async () => {
  describe('full page capture edge classic (@edge)', () => {
    let eyes
    let driver, destroyDriver

    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'edge-18', remote: 'sauce'})
      eyes = setupEyes({stitchMode: 'CSS'})
      eyes.setMatchTimeout(0)
    })

    after(async () => {
      await destroyDriver()
      await eyes.abortIfNotClosed()
    })

    it('works', async function() {
      eyes.setMatchTimeout(0)
      await spec.visit(driver, 'https://www.softwareadvice.com/medical/?automated=true')
      await eyes.open(driver, this.test.parent.title, 'full-page-capture-edge-classic')
      await eyes.check(
        undefined,
        Target.window()
          .fully()
          .scrollRootElement(By.css('body')),
      )
      await eyes.close(true)
    })
  })
})
