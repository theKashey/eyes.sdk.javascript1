const assert = require('assert')
const {isElementScrollable} = require('../dist/index')

describe('isElementScrollable', () => {
  const urls = {
    snippetsTestPage: 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/',
    overflowingTestPage:
      'https://applitools.github.io/demo/TestPages/OverflowingElementWithoutOverflowAttribute/',
  }

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('scrollable element', async () => {
      await page.goto(urls.snippetsTestPage)
      const element = await page.$('#scrollable')
      const isScrollable = await page.evaluate(isElementScrollable, [element])
      assert.ok(isScrollable)
    })

    it('not scrollable element', async () => {
      await page.goto(urls.snippetsTestPage)
      let element = await page.$('#static')
      let isScrollable = await page.evaluate(isElementScrollable, [element])
      assert.ok(!isScrollable)

      await page.goto(urls.overflowingTestPage)
      element = await page.$('div')
      isScrollable = await page.evaluate(isElementScrollable, [element])
      assert.ok(!isScrollable)
    })
  })

  for (const name of ['internet explorer', 'ios safari', 'firefox']) {
    describe(name, () => {
      let driver

      before(async function() {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('scrollable element', async () => {
        await driver.url(urls.snippetsTestPage)
        const element = await driver.$('#scrollable')
        const isScrollable = await driver.execute(isElementScrollable, [element])
        assert.ok(isScrollable)
      })

      it('not scrollable element', async () => {
        await driver.url(urls.snippetsTestPage)
        let element = await driver.$('#static')
        let isScrollable = await driver.execute(isElementScrollable, [element])
        assert.ok(!isScrollable)

        await driver.url(urls.overflowingTestPage)
        element = await driver.$('div')
        isScrollable = await driver.execute(isElementScrollable, [element])
        assert.ok(!isScrollable)
      })
    })
  }
})
