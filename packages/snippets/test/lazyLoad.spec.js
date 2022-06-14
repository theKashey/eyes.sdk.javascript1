const assert = require('assert')
const {lazyLoad} = require('../dist/index')

describe('lazyLoad', () => {
  const pages = {
    snippetsTestPage: 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/',
    cannotScroll: 'data:text/html,%3Ch1%3EHello%2C%20World%21%3C%2Fh1%3E',
    infiniteScroll: 'https://applitools.github.io/demo/TestPages/InfiniteScroll/',
  }
  const options = {
    scrollLength: 300,
    waitingTime: 1,
    maxAmountToScroll: 15000,
  }
  const startingPosition = {x: 10, y: 50}

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('works on a page that can scroll', async () => {
      await page.goto(pages.snippetsTestPage)
      await page.evaluate(`window.scrollTo(${startingPosition.x}, ${startingPosition.y})`)
      const scrollableHeight = await page.evaluate(
        () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
      )
      await page.evaluate(lazyLoad, [options])
      let result
      do {
        result = JSON.parse(await page.evaluate(lazyLoad))
      } while (result.status && result.status === 'WIP')
      const transactionHistory = result.value
      console.log(transactionHistory)
      const scrolledHeight = transactionHistory[transactionHistory.length - 2].y
      const resetScroll = transactionHistory[transactionHistory.length - 1]
      assert.deepStrictEqual(scrolledHeight, scrollableHeight)
      assert.deepStrictEqual(resetScroll.x, startingPosition.x)
      assert.deepStrictEqual(resetScroll.y, startingPosition.y)
    })

    it('works on a page that cannot scroll', async () => {
      await page.goto(pages.cannotScroll)
      await page.evaluate(lazyLoad, [options])
      let result
      do {
        result = JSON.parse(await page.evaluate(lazyLoad))
      } while (result.status && result.status === 'WIP')
      const transactionHistory = result.value
      console.log(transactionHistory)
      const scrolledHeight = transactionHistory[transactionHistory.length - 2].y
      const resetScroll = transactionHistory[transactionHistory.length - 1]
      assert.deepStrictEqual(scrolledHeight, 0)
      assert.deepStrictEqual(resetScroll.x, 0)
      assert.deepStrictEqual(resetScroll.y, 0)
    })

    it('works on a page with infinite scroll', async () => {
      await page.goto(pages.infiniteScroll)
      await page.evaluate(lazyLoad, [options])
      let result
      do {
        result = JSON.parse(await page.evaluate(lazyLoad))
      } while (result.status && result.status === 'WIP')
      const transactionHistory = result.value
      console.log(transactionHistory)
      const scrolledHeight = transactionHistory[transactionHistory.length - 2].y
      const resetScroll = transactionHistory[transactionHistory.length - 1]
      assert.deepStrictEqual(scrolledHeight, options.maxAmountToScroll)
      assert.deepStrictEqual(resetScroll.x, 0)
      assert.deepStrictEqual(resetScroll.y, 0)
    })
  })

  for (const name of ['internet explorer', 'ios safari']) {
    describe(name, () => {
      let driver
      before(async function() {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('works on a page that can scroll', async () => {
        await driver.url(pages.snippetsTestPage)
        await driver.execute(`window.scrollTo(${startingPosition.x}, ${startingPosition.y})`)
        const scrollableHeight = await driver.execute(function() {
          return document.documentElement.scrollHeight - document.documentElement.clientHeight
        })
        await driver.execute(lazyLoad, [options])
        let result
        do {
          result = JSON.parse(await driver.execute(lazyLoad))
        } while (result.status && result.status === 'WIP')
        const transactionHistory = result.value
        console.log(transactionHistory)
        const scrolledHeight = transactionHistory[transactionHistory.length - 2].y
        const resetScroll = transactionHistory[transactionHistory.length - 1]
        assert(scrollableHeight - options.scrollLength <= scrolledHeight <= scrollableHeight)
        assert.deepStrictEqual(resetScroll.x, startingPosition.x)
        assert.deepStrictEqual(resetScroll.y, startingPosition.y)
      })

      it('works on a page that cannot scroll', async () => {
        await driver.url(pages.cannotScroll)
        await driver.execute(lazyLoad, [options])
        let result
        do {
          result = JSON.parse(await driver.execute(lazyLoad))
        } while (result.status && result.status === 'WIP')
        const transactionHistory = result.value
        console.log(transactionHistory)
        const scrolledHeight = transactionHistory[transactionHistory.length - 2].y
        const resetScroll = transactionHistory[transactionHistory.length - 1]
        assert.deepStrictEqual(scrolledHeight, 0)
        assert.deepStrictEqual(resetScroll.x, 0)
        assert.deepStrictEqual(resetScroll.y, 0)
      })

      it('works on a page with infinite scroll', async () => {
        await driver.url(pages.infiniteScroll)
        await driver.execute(lazyLoad, [options])
        let result
        do {
          result = JSON.parse(await driver.execute(lazyLoad))
        } while (result.status && result.status === 'WIP')
        const transactionHistory = result.value
        console.log(transactionHistory)
        const scrolledHeight = transactionHistory[transactionHistory.length - 2].y
        const resetScroll = transactionHistory[transactionHistory.length - 1]
        assert.deepStrictEqual(scrolledHeight, options.maxAmountToScroll)
        assert.deepStrictEqual(resetScroll.x, 0)
        assert.deepStrictEqual(resetScroll.y, 0)
      })
    })
  }
})
