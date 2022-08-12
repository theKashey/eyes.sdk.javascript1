import type {Size, Cookie} from '@applitools/types'
import assert from 'assert'
import * as spec from '../../src/spec-driver/webdriver'

function extractElementId(element: any) {
  return element.elementId || element['element-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
}

function equalElements(driver: spec.Driver, element1: spec.Element, element2: spec.Element): Promise<boolean> {
  return driver.executeScript('return arguments[0] === arguments[1]', [element1, element2]).catch(() => false)
}

describe('webdriver spec driver', async () => {
  let driver: spec.Driver, destroyDriver
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop (@webdriver)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.navigateTo(url)
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await driver.findElement('css selector', 'div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector({using, value})', async () => {
      await isSelector({input: {using: 'xpath', value: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformDriver(static-driver)', async () => {
      const serverUrl = `${driver.options.protocol}://${driver.options.hostname}:${driver.options.port}/${driver.options.path}`
      await transformDriver({input: {sessionId: driver.sessionId, serverUrl, capabilities: driver.capabilities}})
    })
    it('transformElement(element)', async () => {
      await transformElement({input: await driver.findElement('css selector', 'div')})
    })
    it('transformElement(static-element)', async () => {
      await transformElement({input: {elementId: 'element-guid'}})
    })
    it('untransformSelector(css-selector)', async () => {
      await untransformSelector({
        input: {using: 'css selector', value: '.class'},
        expected: {type: 'css', selector: '.class'},
      })
    })
    it('untransformSelector(xpath-selector)', async () => {
      await untransformSelector({
        input: {using: 'xpath', value: '//html'},
        expected: {type: 'xpath', selector: '//html'},
      })
    })
    it('untransformSelector(string)', async () => {
      await untransformSelector({input: '.class' as any, expected: '.class'})
    })
    it('untransformSelector(common-selector)', async () => {
      await untransformSelector({
        input: {type: 'selector', selector: '.class'} as any,
        expected: {type: 'selector', selector: '.class'},
      })
    })
    it('isEqualElements(element, element)', async () => {
      const element = await driver.findElement('css selector', 'div')
      await isEqualElements({
        input: {element1: element, element2: element},
        expected: true,
      })
    })
    it('isEqualElements(element1, element2)', async () => {
      isEqualElements({
        input: {
          element1: await driver.findElement('css selector', 'div'),
          element2: await driver.findElement('css selector', 'h1'),
        },
        expected: false,
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
    it('executeScript(strings, args)', async () => {
      await executeScript()
    })
    it('findElement({using, value})', async () => {
      await findElement({input: {selector: {using: 'css selector', value: 'div'}}})
    })
    it('findElement({using, value}, parent)', async () => {
      await findElement({
        input: {
          selector: {using: 'css selector', value: 'div'},
          parent: await driver.findElement('css selector', '#stretched'),
        },
      })
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {using: 'css selector', value: 'non-existent'}}, expected: null})
    })
    it('findElements({using, value})', async () => {
      await findElements({input: {selector: {using: 'css selector', value: 'div'}}})
    })
    it('findElements({using, value}, parent)', async () => {
      await findElements({
        input: {
          selector: {using: 'css selector', value: 'div'},
          parent: await driver.findElement('css selector', '#stretched'),
        },
      })
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {using: 'css selector', value: 'non-existent'}}})
    })
    it('getCookies()', async () => {
      await getCookies()
    })
    it('getCookies(context)', async () => {
      await getCookies({input: {context: true}})
    })
    it('getTitle()', async () => {
      await getTitle()
    })
    it('getUrl()', async () => {
      await getUrl()
    })
    it('visit()', async () => {
      await visit()
    })
  })

  describe('onscreen desktop (@webdriver)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome', headless: false})
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 551, height: 552}})
    })
  })

  describe('legacy browser (@webdriver)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'ie-11', legacy: true})
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize({legacy: true})
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({legacy: true, input: {width: 551, height: 552}})
    })
  })

  describe('mobile browser (@mobile)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'portrait'})
    })
  })

  describe('native app (@mobile @native)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        app: 'http://saucelabs.com/example_files/ContactManager.apk',
        device: 'Android Emulator',
        orientation: 'landscape',
      })
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'landscape'})
    })
  })

  async function isDriver({input, expected}: {input: spec.Driver; expected: boolean}) {
    const result = await spec.isDriver(input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}: {input: spec.Element; expected: boolean}) {
    const result = await spec.isElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: spec.Selector; expected: boolean}) {
    const result = await spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function isEqualElements({
    input,
    expected,
  }: {
    input: {element1: spec.Element; element2: spec.Element}
    expected: boolean
  }) {
    const result = await spec.isEqualElements(driver, input.element1, input.element2)
    assert.deepStrictEqual(result, expected)
  }
  async function transformDriver({input}: {input: spec.StaticDriver}) {
    const transformedDriver = spec.transformDriver(input)
    const result = await transformedDriver.getUrl()
    const expected = await transformedDriver.getUrl()
    assert.deepStrictEqual(result, expected)
  }
  async function transformElement({input}: {input: spec.Element | spec.StaticElement}) {
    const elementId = extractElementId(input)
    const result = spec.transformElement(input)
    assert.deepStrictEqual(result, {
      ELEMENT: elementId,
      'element-6066-11e4-a52e-4f735466cecf': elementId,
    })
  }
  async function untransformSelector({
    input,
    expected,
  }: {
    input: spec.Selector
    expected: {type: string; selector: string} | string | null
  }) {
    assert.deepStrictEqual(spec.untransformSelector(input), expected)
  }
  async function executeScript() {
    const element = await driver.findElement('css selector', 'html')
    const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
    const [resultElement, ...resultArgs] = await spec.executeScript(driver, 'return arguments[0]', [element, ...args])
    assert.deepStrictEqual(resultArgs, args)
    assert.ok(await spec.isEqualElements(driver, resultElement, element))
  }
  async function mainContext() {
    try {
      const mainDocument = await driver.findElement('css selector', 'html')
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame1"]'))
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame1-1"]'))
      const frameDocument = await driver.findElement('css selector', 'html')
      assert.ok(!(await spec.isEqualElements(driver, mainDocument, frameDocument)))
      await spec.mainContext(driver)
      const resultDocument = await driver.findElement('css selector', 'html')
      assert.ok(await spec.isEqualElements(driver, resultDocument, mainDocument))
    } finally {
      await driver.switchToFrame(null).catch(() => null)
    }
  }
  async function parentContext() {
    try {
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame1"]'))
      const parentDocument = await driver.findElement('css selector', 'html')
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame1-1"]'))
      const frameDocument = await driver.findElement('css selector', 'html')
      assert.ok(!(await spec.isEqualElements(driver, parentDocument, frameDocument)))
      await spec.parentContext(driver)
      const resultDocument = await driver.findElement('css selector', 'html')
      assert.ok(await spec.isEqualElements(driver, resultDocument, parentDocument))
    } finally {
      await driver.switchToFrame(null).catch(() => null)
    }
  }
  async function childContext() {
    try {
      const element = await driver.findElement('css selector', '[name="frame1"]')
      await driver.switchToFrame(element)
      const expectedDocument = await driver.findElement('css selector', 'html')
      await driver.switchToFrame(null)
      await spec.childContext(driver, element)
      const resultDocument = await driver.findElement('css selector', 'html')
      assert.ok(await spec.isEqualElements(driver, resultDocument, expectedDocument))
    } finally {
      await driver.switchToFrame(null).catch(() => null)
    }
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element | null
  }) {
    if (expected === undefined) {
      expected = input.parent
        ? await driver.findElementFromElement(
            extractElementId(input.parent),
            input.selector.using,
            input.selector.value,
          )
        : await driver.findElement(input.selector.using, input.selector.value)
    }
    const element = await spec.findElement(driver, input.selector, input.parent)
    if (element !== expected) {
      assert.ok(await equalElements(driver, element, expected as spec.Element))
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element[]
  }) {
    if (expected === undefined) {
      expected = input.parent
        ? await driver.findElementsFromElement(
            extractElementId(input.parent),
            input.selector.using,
            input.selector.value,
          )
        : await driver.findElements(input.selector.using, input.selector.value)
    }
    const elements = await spec.findElements(driver, input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(driver, element, expected[index]))
    }
  }
  async function getWindowSize({legacy = false} = {}) {
    let size
    if (legacy) {
      size = await driver._getWindowSize()
    } else {
      const {width, height} = await driver.getWindowRect()
      size = {width, height}
    }
    const result = await spec.getWindowSize(driver)
    assert.deepStrictEqual(result, size)
  }
  async function setWindowSize({legacy = false, input}: {legacy?: boolean; input: Size}) {
    await spec.setWindowSize(driver, input)
    let rect
    if (legacy) {
      const {x, y} = await driver.getWindowPosition()
      const {width, height} = await driver._getWindowSize()
      rect = {x, y, width, height}
    } else {
      rect = await driver.getWindowRect()
    }
    assert.deepStrictEqual(rect, {x: 0, y: 0, ...input})
  }
  async function getCookies({input}: {input?: {context: boolean}} = {}) {
    const cookie: Cookie = {
      name: 'hello',
      value: 'world',
      domain: input?.context ? '.applitools.github.io' : 'google.com',
      path: '/',
      expiry: 4025208067,
      httpOnly: true,
      secure: true,
    }
    if (input?.context) {
      await driver.addCookie(cookie)
    } else {
      const request = {...cookie, expires: cookie.expiry}
      await driver.sendCommandAndGetResult('Network.setCookie', request)
    }
    const result = await spec.getCookies(driver, input?.context)
    assert.deepStrictEqual(result, [cookie])
  }
  async function getOrientation({expected}: {expected: string}) {
    const result = await spec.getOrientation(driver)
    assert.strictEqual(result, expected)
  }
  async function getTitle() {
    const expected = await driver.getTitle()
    const result = await spec.getTitle(driver)
    assert.deepStrictEqual(result, expected)
  }
  async function getUrl() {
    const result = await spec.getUrl(driver)
    assert.deepStrictEqual(result, url)
  }
  async function visit() {
    const blank = 'about:blank'
    await spec.visit(driver, blank)
    const actual = await driver.getUrl()
    assert.deepStrictEqual(actual, blank)
    await driver.navigateTo(url)
  }
})
