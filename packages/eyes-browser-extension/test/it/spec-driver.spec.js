/* global browser */

const assert = require('assert')
const spec = require('../utils/spec-driver')

describe('spec driver', async () => {
  let driver, backgroundPage, contentPage, destroyPage
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('onscreen desktop (@chrome)', async () => {
    before(async () => {
      ;[contentPage, destroyPage] = await spec.build({browser: 'chromium'})

      backgroundPage =
        contentPage.context().backgroundPages()[0] || (await contentPage.context().waitForEvent('backgroundpage'))

      await contentPage.goto(url)

      contentPage.on('console', async msg => {
        for (let i = 0; i < msg.args().length; ++i)
          console.log(`${i}: ${JSON.stringify(await msg.args()[i].jsonValue())}`)
      })

      backgroundPage.on('console', async msg => {
        for (let i = 0; i < msg.args().length; ++i)
          console.log(`${i}: ${JSON.stringify(await msg.args()[i].jsonValue())}`)
      })

      const [activeTab] = await backgroundPage.evaluate(() => browser.tabs.query({active: true}))
      driver = {windowId: activeTab.windowId, tabId: activeTab.id}
    })

    after(async () => {
      await destroyPage()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {}, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: {'applitools-ref-id': 'element-id'}, expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {}, expected: false})
    })
    it('isSelector({type, selector}})', async () => {
      await isSelector({input: {type: 'css', selector: 'div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {}, expected: false})
    })
    it('transformSelector({type, selector})', async () => {
      await transformSelector({
        input: {type: 'xpath', selector: '//element'},
        expected: {type: 'xpath', selector: '//element'},
      })
    })
    it('transformSelector(string)', async () => {
      await transformSelector({input: 'div', expected: {type: 'css', selector: 'div'}})
    })
    it('transformSelector(common-selector)', async () => {
      await transformSelector({
        input: {selector: {type: 'xpath', selector: '//element'}},
        expected: {type: 'xpath', selector: '//element'},
      })
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
    it('executeScript(script, args)', async () => {
      await executeScript()
    })
    it('findElement(selector)', async () => {
      await findElement({input: {selector: {type: 'css', selector: 'h1'}}})
    })
    it('findElement(selector, parent-element)', async () => {
      await findElement({input: {selector: {type: 'css', selector: 'div'}, parent: await contentPage.$('#stretched')}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {type: 'css', selector: 'non-existent'}}, expected: null})
    })
    it('findElements(selector)', async () => {
      await findElements({input: {selector: {type: 'css', selector: 'div'}}})
    })
    it('findElements(string, parent-element)', async () => {
      await findElements({input: {selector: {type: 'css', selector: 'div'}, parent: await contentPage.$('#stretched')}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {type: 'css', selector: 'non-existent'}}, expected: []})
    })
    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 501, height: 502}, expected: {width: 501, height: 502}})
    })
    it('getCookies()', async () => {
      await getCookies()
    })
    it('getTitle()', async () => {
      await getTitle()
    })
    it('getUrl()', async () => {
      await getUrl()
    })
  })

  async function isDriver({input, expected}) {
    const result = await backgroundPage.evaluate(driver => spec.isDriver(driver), input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}) {
    const result = await backgroundPage.evaluate(element => spec.isElement(element), input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}) {
    const result = await backgroundPage.evaluate(selector => spec.isSelector(selector), input)
    assert.strictEqual(result, expected)
  }
  async function transformSelector({input, expected}) {
    const result = await backgroundPage.evaluate(selector => spec.transformSelector(selector), input)
    assert.deepStrictEqual(result, expected || input)
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
  async function findElement({input, expected}) {
    const root = input.parent || contentPage
    expected = expected === undefined ? await root.$(input.selector.selector) : expected
    if (input.parent) {
      const parentElementKey = await input.parent.evaluate(element => (element.dataset.key = 'parent-element-key'))
      input.parent = await backgroundPage.evaluate(
        ([driver, selector]) => spec.findElement(driver, selector),
        [driver, {type: 'css', selector: `[data-key="${parentElementKey}"]`}],
      )
    }
    const element = await backgroundPage.evaluate(
      ([driver, input]) => spec.findElement(driver, input.selector, input.parent),
      [driver, input],
    )
    if (element !== expected) {
      const elementKey = await expected.evaluate(element => (element.dataset.key = 'element-key'))
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
  }
  async function findElements({input, expected}) {
    const root = input.parent ?? contentPage
    expected = expected === undefined ? await root.$$(input.selector.selector) : expected
    if (input.parent) {
      const parentElementKey = await input.parent.evaluate(element => (element.dataset.key = 'parent-element-key'))
      input.parent = await backgroundPage.evaluate(
        ([driver, selector]) => spec.findElement(driver, selector),
        [driver, {type: 'css', selector: `[data-key="${parentElementKey}"]`}],
      )
    }
    const elements = await backgroundPage.evaluate(
      ([driver, input]) => spec.findElements(driver, input.selector, input.parent),
      [driver, input],
    )
    assert.strictEqual(elements.length, expected.length)
    for (const [index, expectedElement] of expected.entries()) {
      const elementKey = await expectedElement.evaluate(element => (element.dataset.key = 'element-key'))
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
  async function getCookies() {
    const cookie = {
      name: 'hello',
      value: 'world',
      domain: 'google.com',
      path: '/',
      expiry: 4025208067,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }
    await contentPage.context().addCookies([{...cookie, expires: cookie.expiry}])
    const cookies = await backgroundPage.evaluate(driver => spec.getCookies(driver), driver)
    assert.deepStrictEqual(cookies, [cookie])
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
