/* global browser, spec */

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const playwright = require('playwright')

describe('spec driver', async () => {
  let driver, backgroundPage, contentPage, destroyBrowser
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('onscreen desktop (@chrome)', async () => {
    before(async () => {
      const userDataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-user-data-dir'))
      const extensionPath = path.resolve(process.cwd(), './dist')
      const context = await playwright.chromium.launchPersistentContext(userDataPath, {
        headless: false,
        args: [`--load-extension=${extensionPath}`, `--disable-extensions-except=${extensionPath}`],
        ignoreDefaultArgs: [`--hide-scrollbars`],
      })
      destroyBrowser = () => context.close()

      backgroundPage = context.backgroundPages()[0] || (await context.waitForEvent('backgroundpage'))
      contentPage = await context.newPage()
      await contentPage.goto(url)

      const [activeTab] = await backgroundPage.evaluate(() => browser.tabs.query({active: true}))
      driver = {windowId: activeTab.windowId, tabId: activeTab.id}
    })

    after(async () => {
      await destroyBrowser()
    })

    it('isDriver(driver)', async () => {
      await isDriver({expected: true})
    })
    it('isDriver(wrong)', async () => {
      isDriver({input: {notDriver: true}, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: {'applitools-ref-id': 'element-id'}, expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {}, expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {}, expected: false})
    })
    it('executeScript(script, args)', async () => {
      await executeScript()
    })
    it('mainContext()', async () => {
      await mainContext()
    })
    it('parentContext()', async () => {
      await parentContext()
    })
    it('childContext(element)', async () => {
      await childContext()
    })
    it('findElement(string)', async () => {
      findElement({input: 'h1'})
    })
    it('findElement(non-existent)', async () => {
      findElement({input: 'non-existent', expected: null})
    })
    it('findElements(string)', async () => {
      await findElements({input: 'div'})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: 'non-existent', expected: []})
    })
    it('getTitle()', async () => {
      await getTitle()
    })
    it('getUrl()', async () => {
      await getUrl()
    })
    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 501, height: 502}, expected: {width: 501, height: 502}})
    })
  })

  async function isDriver({input, expected}) {
    const isDriver = await backgroundPage.evaluate(driver => spec.isDriver(driver), input || driver)
    assert.strictEqual(isDriver, expected)
  }
  async function isElement({input, expected}) {
    const isElement = await backgroundPage.evaluate(element => spec.isElement(element), input)
    assert.strictEqual(isElement, expected)
  }
  async function isSelector({input, expected}) {
    const isSelector = await backgroundPage.evaluate(element => spec.isSelector(element), input)
    assert.strictEqual(isSelector, expected)
  }
  async function executeScript() {
    const arg = {
      num: 0,
      str: 'string',
      obj: {key: 'value', obj: {key: 0}},
      arr: [0, 1, 2, {key: 3}],
    }
    const result = await backgroundPage.evaluate(
      ([driver, arg]) => spec.executeScript(driver, arg => arg, arg),
      [driver, arg],
    )

    assert.deepStrictEqual(result, arg)
  }
  async function mainContext() {
    const mainContext = await backgroundPage.evaluate(([driver]) => spec.mainContext(driver), [driver])
    assert.strictEqual(mainContext.frameId, 0)
  }
  async function parentContext() {
    const nestedFrame = await backgroundPage.evaluate(
      async ([driver]) => {
        const frames = await browser.webNavigation.getAllFrames({tabId: driver.tabId})
        return frames[frames.length - 1]
      },
      [driver],
    )
    const parentContext = await backgroundPage.evaluate(
      ([context]) => spec.parentContext(context),
      [{...driver, frameId: nestedFrame.frameId}],
    )
    assert.deepStrictEqual(parentContext, {...driver, frameId: nestedFrame.parentFrameId})
  }
  async function childContext() {
    const childFrame = await backgroundPage.evaluate(
      async ([driver]) => {
        const frames = await browser.webNavigation.getAllFrames({tabId: driver.tabId})
        return frames.find(
          frame => frame.url === 'https://applitools.github.io/demo/TestPages/FramesTestPage/frame2.html',
        )
      },
      [driver],
    )
    const childContext = await backgroundPage.evaluate(
      async ([context]) => {
        const [element] = await browser.tabs.executeScript(context.tabId, {
          code: `JSON.stringify(refer.ref(document.querySelector('[src="./frame2.html"]')))`,
          frameId: context.frameId,
        })
        return spec.childContext(context, JSON.parse(element))
      },
      [{...driver, frameId: 0}],
    )
    assert.deepStrictEqual(childContext.frameId, childFrame.frameId)
  }
  async function findElement({input, expected} = {}) {
    const element = await backgroundPage.evaluate(
      ([driver, selector]) => spec.findElement(driver, selector),
      [driver, input],
    )
    if (element === expected) return
    const elementKey = await contentPage.$eval(input, element => (element.dataset.key = 'element-key'))
    const isCorrectElement = await backgroundPage.evaluate(
      async ([context, element, elementKey]) => {
        const [isCorrectElement] = await browser.tabs.executeScript(context.tabId, {
          code: `refer.deref(${JSON.stringify(element)}).dataset.key === '${elementKey}'`,
          frameId: context.frameId,
        })
        return isCorrectElement
      },
      [{...driver, frameId: 0}, element, elementKey],
    )
    assert.ok(isCorrectElement)
  }
  async function findElements({input} = {}) {
    const elements = await backgroundPage.evaluate(
      ([driver, selector]) => spec.findElements(driver, selector),
      [driver, input],
    )
    const elementKeys = await contentPage.$$eval(input, elements =>
      elements.map((element, index) => (element.dataset.key = `element-key-${index}`)),
    )
    assert.strictEqual(elements.length, elementKeys.length)
    for (const [index, elementKey] of elementKeys.entries()) {
      const isCorrectElement = await backgroundPage.evaluate(
        async ([context, element, elementKey]) => {
          const [isCorrectElement] = await browser.tabs.executeScript(context.tabId, {
            code: `refer.deref(${JSON.stringify(element)}).dataset.key === '${elementKey}'`,
            frameId: context.frameId,
          })
          return isCorrectElement
        },
        [{...driver, frameId: 0}, elements[index], elementKey],
      )
      assert.ok(isCorrectElement)
    }
  }
  async function getWindowSize() {
    const expected = await contentPage.evaluate(() => ({width: window.outerWidth, height: window.outerHeight}))
    const result = await backgroundPage.evaluate(([driver]) => spec.getWindowSize(driver), [driver])
    assert.deepStrictEqual(result, expected)
  }
  async function setWindowSize({input, expected} = {}) {
    await backgroundPage.evaluate(([driver, size]) => spec.setWindowSize(driver, size), [driver, input])
    const actual = await contentPage.evaluate(() => ({width: window.outerWidth, height: window.outerHeight}))
    assert.deepStrictEqual(actual, expected)
  }
  async function getTitle() {
    const expected = await contentPage.title()
    const result = await backgroundPage.evaluate(async ([driver]) => spec.getTitle(driver), [driver])
    assert.deepStrictEqual(result, expected)
  }
  async function getUrl() {
    const result = await backgroundPage.evaluate(async ([driver]) => spec.getUrl(driver), [driver])
    assert.deepStrictEqual(result, url)
  }
})
