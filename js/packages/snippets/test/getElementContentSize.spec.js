const assert = require('assert')
const {getElementContentSize} = require('../dist/index')

describe('getElementContentSize', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('return size of scrollable element', async () => {
      await page.goto(url)
      const element = await page.$('#scrollable')
      const size = await page.evaluate(getElementContentSize, [element])
      assert.deepStrictEqual(size, {width: 600, height: 600})
    })

    it('return size of static element', async () => {
      await page.goto(url)
      const element = await page.$('#static')
      const size = await page.evaluate(getElementContentSize, [element])
      assert.deepStrictEqual(size, {width: 294, height: 294})
    })

    it('return size of translated html element', async () => {
      await page.goto(url)
      page.evaluate(() => (document.documentElement.style.transform = 'translate(-10px, -11px)'))
      const element = await page.$('html')
      const size = await page.evaluate(getElementContentSize, [element])
      assert.deepStrictEqual(size, {width: 3000, height: 3000})
    })
  })

  for (const name of ['internet explorer', 'ios safari']) {
    const expectedSizes = {
      'internet explorer': {width: 566, height: 566},
      'ios safari': {width: 600, height: 600},
    }

    describe(name, () => {
      let driver

      before(async function() {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('return size of scrollable element', async () => {
        await driver.url(url)
        const element = await driver.$('#scrollable')
        const size = await driver.execute(getElementContentSize, [element])
        assert.deepStrictEqual(size, expectedSizes[name])
      })

      it('return size of static element', async () => {
        await driver.url(url)
        const element = await driver.$('#static')
        const size = await driver.execute(getElementContentSize, [element])
        assert.deepStrictEqual(size, {width: 294, height: 294})
      })

      it('return size of translated html element', async () => {
        await driver.url(url)
        driver.execute('document.documentElement.style.transform = "translate(-10px, -11px)"')
        const element = await driver.$('html')
        const size = await driver.execute(getElementContentSize, [element])
        assert.deepStrictEqual(size, {width: 3000, height: 3000})
      })
    })
  }
})
