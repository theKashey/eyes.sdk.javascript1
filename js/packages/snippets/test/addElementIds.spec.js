const assert = require('assert')
const {addElementIds} = require('../dist/index')

describe('addElementIds', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('standard dom', async () => {
      await page.goto(url)
      const elements = await page.$$('#scrollable,#static,#fixed')
      const ids = ['1', '2', '3']
      const selectors = await page.evaluate(addElementIds, [elements, ids])
      assert.deepStrictEqual(selectors.length, elements.length)
      const results = await page.evaluate(
        ([elements, selectors]) => {
          return selectors.map(([selector], index) => {
            const requiredElement = elements[index]
            const element = document.querySelector(selector)
            return element === requiredElement
          })
        },
        [elements, selectors],
      )
      assert.deepStrictEqual(results, Array(elements.length).fill(true))
    })

    it('shadow dom', async () => {
      await page.goto(url)
      const elements = await page.$$('#shadow,#shadow-child,#shadow-inner-child')
      const ids = ['1', '2', '3']
      const selectors = await page.evaluate(addElementIds, [elements, ids])
      assert.deepStrictEqual(selectors.length, elements.length)
      const results = await page.evaluate(
        ([elements, selectors]) => {
          return selectors.map((selectors, index) => {
            const requiredElement = elements[index]
            const elementSelector = selectors[selectors.length - 1]
            const shadowRootSelectors = selectors.slice(0, -1)
            let root = document
            for (const shadowRootSelector of shadowRootSelectors) {
              root = root.querySelector(shadowRootSelector).shadowRoot
            }
            const element = root.querySelector(elementSelector)
            return element === requiredElement
          })
        },
        [elements, selectors],
      )
      assert.deepStrictEqual(results, Array(elements.length).fill(true))
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

      it('standard dom', async () => {
        await driver.url(url)
        const elements = await driver.$$('#scrollable,#static,#fixed')
        const ids = ['1', '2', '3']
        const selectors = await driver.execute(addElementIds, [elements, ids])
        assert.deepStrictEqual(selectors.length, elements.length)
        const results = await driver.execute(
          function(elements, selectors) {
            return selectors.map(function(selectors, index) {
              const requiredElement = elements[index]
              const element = document.querySelector(selectors[0])
              return element === requiredElement
            })
          },
          elements,
          selectors,
        )
        assert.deepStrictEqual(results, Array(elements.length).fill(true))
      })
    })
  }
})
