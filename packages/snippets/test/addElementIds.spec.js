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
      const elementMapping = {1: elements[0], 2: elements[1], 3: elements[2]}
      const selectorMapping = await page.evaluate(addElementIds, [
        Object.values(elementMapping),
        Object.keys(elementMapping),
      ])
      assert.deepStrictEqual(Object.keys(elementMapping), Object.keys(selectorMapping))
      const results = await page.evaluate(
        ([elementMapping, selectorMapping]) => {
          return Object.entries(selectorMapping).map(([elementId, [selector]]) => {
            const requiredElement = elementMapping[elementId]
            const element = document.querySelector(selector)
            return element === requiredElement
          })
        },
        [elementMapping, selectorMapping],
      )
      assert.deepStrictEqual(results, Array(elements.length).fill(true))
    })

    it('shadow dom', async () => {
      await page.goto(url)
      const elements = await page.$$('#shadow,#shadow-child,#shadow-inner-child')
      const elementMapping = {1: elements[0], 2: elements[1], 3: elements[2]}
      const selectorMapping = await page.evaluate(addElementIds, [
        Object.values(elementMapping),
        Object.keys(elementMapping),
      ])
      assert.deepStrictEqual(Object.keys(elementMapping), Object.keys(selectorMapping))
      const results = await page.evaluate(
        ([elementMapping, selectorMapping]) => {
          return Object.entries(selectorMapping).map(([elementId, selectors]) => {
            const requiredElement = elementMapping[elementId]
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
        [elementMapping, selectorMapping],
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
        const elementMapping = {1: elements[0], 2: elements[1], 3: elements[2]}
        const selectorMapping = await driver.execute(addElementIds, [
          Object.values(elementMapping),
          Object.keys(elementMapping),
        ])
        assert.deepStrictEqual(Object.keys(elementMapping), Object.keys(selectorMapping))
        const results = await driver.execute(
          function(elements, selectors) {
            return selectors.map(function(selectors, index) {
              const requiredElement = elements[index]
              const element = document.querySelector(selectors[0])
              return element === requiredElement
            })
          },
          Object.values(elementMapping),
          Object.values(selectorMapping),
        )
        assert.deepStrictEqual(results, Array(elements.length).fill(true))
      })
    })
  }
})
