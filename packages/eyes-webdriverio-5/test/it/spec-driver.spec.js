const assert = require('assert')
const os = require('os')
const spec = require('../../dist/spec-driver')
const {By} = require('../../dist/legacy')

describe('spec driver', async () => {
  let browser, destroyBrowser
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop (@webdriver)', async () => {
    before(function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
    })

    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'chrome'})
      await browser.url(url)
    })

    after(async () => {
      if (destroyBrowser) await destroyBrowser()
    })

    it('isDriver(driver)', async () => {
      await isDriver({expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {}, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: () => browser.findElement('css selector', 'div'), expected: true})
    })
    it('isElement(extended-element)', async () => {
      await isElement({input: () => browser.$('div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: () => ({}), expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(function)', async () => {
      await isSelector({input: () => void 0, expected: true})
    })
    it('isSelector(by)', async () => {
      await isSelector({input: By.xpath('//div'), expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {}, expected: false})
    })
    it('transformElement(element)', async () => {
      await transformElement({input: () => browser.findElement('css selector', 'div')})
    })
    it('transformElement(extended-element)', async () => {
      await transformElement({input: () => browser.$('div')})
    })
    it('isEqualElements(element, element)', async () => {
      await isEqualElements({
        input: () => browser.$('div').then(element => ({element1: element, element2: element})),
        expected: true,
      })
    })
    it('isEqualElements(element1, element2)', async () => {
      isEqualElements({
        input: async () => ({element1: await browser.$('div'), element2: await browser.$('h1')}),
        expected: false,
      })
    })
    it('extractSelector(element)', async () => {
      await extractSelector({input: () => browser.findElement('css selector', 'div'), expected: undefined})
    })
    it('extractSelector(extended-element)', async () => {
      await extractSelector({input: () => browser.$('div'), expected: 'div'})
    })
    it('executeScript(strings, args)', async () => {
      await executeScript()
    })
    it('findElement(string)', async () => {
      await findElement({input: '#overflowing-div'})
    })
    it('findElements(string)', async () => {
      await findElements({input: 'div'})
    })
    it('findElement(function)', async () => {
      await findElement({
        input: function () {
          return this.document.getElementById('overflowing-div')
        },
      })
    })
    it('findElements(function)', async () => {
      await findElements({
        input: function () {
          return this.document.querySelectorAll('div')
        },
      })
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: 'non-existent', expected: null})
    })
    it('findElements(non-existent)', async () => {
      findElements({input: 'non-existent', expected: []})
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
    it('getSessionId()', async () => {
      await getSessionId()
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
    it('isMobile()', async () => {
      await isMobile({expected: false})
    })
    it('getPlatformName()', async () => {
      await getPlatformName({expected: 'linux'})
    })
  })

  describe('onscreen desktop (@webdriver)', async () => {
    before(function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
    })

    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'chrome', headless: false})
    })

    after(async () => {
      if (destroyBrowser) await destroyBrowser()
    })

    it('getWindowRect()', async () => {
      await getWindowRect()
    })
    it('setWindowRect({x, y, width, height})', async () => {
      await setWindowRect({
        input: {x: 0, y: 0, width: 510, height: 511},
        expected: {x: 0, y: 0, width: 510, height: 511},
      })
    })
    it('setWindowRect({x, y})', async () => {
      await setWindowRect({
        input: {x: 11, y: 12},
        expected: {x: 11, y: 12, width: 510, height: 511},
      })
    })
    it('setWindowRect({width, height})', async () => {
      await setWindowRect({
        input: {width: 551, height: 552},
        expected: {x: 11, y: 12, width: 551, height: 552},
      })
    })
  })

  describe('legacy browser (@webdriver)', async () => {
    before(function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
    })

    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'ie-11', legacy: true})
    })

    after(async () => {
      if (destroyBrowser) await destroyBrowser()
    })

    it('getWindowRect()', async () => {
      await getWindowRect({legacy: true})
    })
    it('setWindowRect({x, y, width, height})', async () => {
      await setWindowRect({
        legacy: true,
        input: {x: 0, y: 0, width: 510, height: 511},
        expected: {x: 0, y: 0, width: 510, height: 511},
      })
    })
    it('setWindowRect({x, y})', async () => {
      await setWindowRect({
        legacy: true,
        input: {x: 11, y: 12},
        expected: {x: 11, y: 12, width: 510, height: 511},
      })
    })
    it('setWindowRect({width, height})', async () => {
      await setWindowRect({
        legacy: true,
        input: {width: 551, height: 552},
        expected: {x: 11, y: 12, width: 551, height: 552},
      })
    })
    it('getPlatformName()', async () => {
      await getPlatformName({expected: 'WINDOWS'})
    })
  })

  describe('mobile browser (@mobile)', async () => {
    before(function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
    })

    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
    })

    after(async () => {
      if (destroyBrowser) await destroyBrowser()
    })

    it('isMobile()', async () => {
      await isMobile({expected: true})
    })
    it('getDeviceName()', async () => {
      await getDeviceName({expected: 'Google Pixel 3a XL GoogleAPI Emulator'})
    })
    it('getPlatformName()', async () => {
      await getPlatformName({expected: 'Android'})
    })
    it('isNative()', async () => {
      await isNative({expected: false})
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'portrait'})
    })
    it('getPlatformVersion()', async () => {
      await getPlatformVersion({expected: '10'})
    })
  })

  describe('native app (@mobile @native)', async () => {
    before(function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
    })

    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({
        app: 'http://saucelabs.com/example_files/ContactManager.apk',
        device: 'Android Emulator',
        orientation: 'landscape',
      })
    })

    after(async () => {
      if (destroyBrowser) await destroyBrowser()
    })

    it('isMobile()', async () => {
      await isMobile({expected: true})
    })
    it('isNative()', async () => {
      await isNative({expected: true})
    })
    it('getDeviceName()', async () => {
      await getDeviceName({expected: 'Android Emulator'})
    })
    it('getPlatformName()', async () => {
      await getPlatformName({expected: 'Android'})
    })
    it('getPlatformVersion()', async () => {
      await getPlatformVersion({expected: '6.0'})
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'landscape'})
    })
  })

  describe('headless desktop (@puppeteer)', async () => {
    before(function () {
      if (Number(process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION) < 7) this.skip()
    })

    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'chrome', protocol: 'cdp'})
      await browser.url(url)
    })

    after(async () => {
      if (destroyBrowser) await destroyBrowser()
    })

    it('isDriver(driver)', async () => {
      await isDriver({expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {}, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: () => browser.findElement('css selector', 'div'), expected: true})
    })
    it('isElement(extended-element)', async () => {
      await isElement({input: () => browser.$('div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: () => ({}), expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(function)', async () => {
      await isSelector({input: () => void 0, expected: true})
    })
    it('isSelector(by)', async () => {
      await isSelector({input: By.xpath('//div'), expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {}, expected: false})
    })
    it('transformElement(element)', async () => {
      await transformElement({input: () => browser.findElement('css selector', 'div')})
    })
    it('transformElement(extended-element)', async () => {
      await transformElement({input: () => browser.$('div')})
    })
    it('extractSelector(element)', async () => {
      await extractSelector({
        input: () => browser.findElement('css selector', 'div'),
        expected: undefined,
      })
    })
    it('extractSelector(extended-element)', async () => {
      await extractSelector({input: () => browser.$('div'), expected: 'div'})
    })
    it('executeScript(strings, args)', async () => {
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
      await findElement({input: '#overflowing-div'})
    })
    it('findElements(string)', async () => {
      await findElements({input: 'div'})
    })
    it('findElement(function)', async () => {
      await findElement({
        input: function () {
          return this.document.getElementById('overflowing-div')
        },
      })
    })
    it('findElements(function)', async () => {
      await findElements({
        input: function () {
          return this.document.querySelectorAll('div')
        },
      })
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: 'non-existent', expected: null})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: 'non-existent', expected: []})
    })
    it('getSessionId()', async () => {
      await getSessionId()
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
    it('isMobile()', async () => {
      await isMobile({expected: false})
    })
    it('getPlatformName()', async () => {
      await getPlatformName({expected: os.type().toLowerCase()})
    })
    it('getWindowRect()', async () => {
      await getWindowRect()
    })
    it('setWindowRect({x, y, width, height})', async () => {
      await setWindowRect({
        input: {x: 0, y: 0, width: 301, height: 302},
        expected: {x: 0, y: 0, width: 301, height: 302},
      })
    })
    it('setWindowRect({width, height})', async () => {
      await setWindowRect({
        input: {width: 551, height: 552},
        expected: {x: null, y: null, width: 551, height: 552},
      })
    })
  })

  async function isDriver({input, expected}) {
    const isDriver = await spec.isDriver(input || browser)
    assert.strictEqual(isDriver, expected)
  }
  async function isElement({input, expected}) {
    const element = await input()
    const isElement = await spec.isElement(element)
    assert.strictEqual(isElement, expected)
  }
  async function isSelector({input, expected}) {
    const isSelector = await spec.isSelector(input)
    assert.strictEqual(isSelector, expected)
  }
  async function isEqualElements({input, expected}) {
    const {element1, element2} = await input()
    const result = await spec.isEqualElements(browser, element1, element2)
    assert.deepStrictEqual(result, expected)
  }
  async function transformElement({input}) {
    const element = await input()
    const elementId = element.elementId || element['element-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
    const result = spec.transformElement(element)
    assert.deepStrictEqual(result, {
      ELEMENT: elementId,
      'element-6066-11e4-a52e-4f735466cecf': elementId,
    })
  }
  async function extractSelector({input, expected}) {
    const selector = spec.extractSelector(await input())
    assert.deepStrictEqual(selector, expected)
  }
  async function executeScript() {
    const element = await browser.$('html')
    const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
    const [resultElement, ...resultArgs] = await spec.executeScript(browser, 'return arguments[0]', [element, ...args])
    assert.deepStrictEqual(resultArgs, args)
    assert.ok(await browser.execute((element1, element2) => element1 === element2, resultElement, element))
  }
  async function mainContext() {
    try {
      const mainDocument = await browser.$('html')
      await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1"]'))
      await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1-1"]'))
      const frameDocument = await browser.$('html')
      assert.ok(!(await spec.isEqualElements(browser, mainDocument, frameDocument)))
      await spec.mainContext(browser)
      const resultDocument = await browser.$('html')
      assert.ok(await spec.isEqualElements(browser, resultDocument, mainDocument))
    } finally {
      await browser.switchToFrame(null).catch(() => null)
    }
  }
  async function parentContext() {
    try {
      await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1"]'))
      const parentDocument = await browser.$('html')
      await browser.switchToFrame(await browser.findElement('css selector', '[name="frame1-1"]'))
      const frameDocument = await browser.$('html')
      assert.ok(!(await spec.isEqualElements(browser, parentDocument, frameDocument)))
      await spec.parentContext(browser)
      const resultDocument = await browser.$('html')
      assert.ok(await spec.isEqualElements(browser, resultDocument, parentDocument))
    } finally {
      await browser.switchToFrame(null).catch(() => null)
    }
  }
  async function childContext() {
    try {
      const element = await browser.findElement('css selector', '[name="frame1"]')
      await browser.switchToFrame(element)
      const expectedDocument = await browser.$('html')
      await browser.switchToFrame(null)
      await spec.childContext(browser, element)
      const resultDocument = await browser.$('html')
      assert.ok(await spec.isEqualElements(browser, resultDocument, expectedDocument))
    } finally {
      await browser.switchToFrame(null).catch(() => null)
    }
  }
  async function findElement({input, expected} = {}) {
    const result = expected !== undefined ? expected : await browser.$(input)
    const element = await spec.findElement(browser, input)
    if (element !== result) {
      assert.ok(await spec.isEqualElements(browser, element, result))
    }
  }
  async function findElements({input, expected} = {}) {
    const result = expected !== undefined ? expected : await browser.$$(input)
    const elements = await spec.findElements(browser, input)
    assert.strictEqual(elements.length, result.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await spec.isEqualElements(browser, element, result[index]))
    }
  }
  async function getWindowRect({legacy = false} = {}) {
    let rect
    if (legacy) {
      const {x, y} = await browser.getWindowPosition()
      const {width, height} = await browser.getWindowSize()
      rect = {x, y, width, height}
    } else {
      rect = await browser.getWindowRect()
    }
    const result = await spec.getWindowRect(browser)
    assert.deepStrictEqual(result, rect)
  }
  async function setWindowRect({legacy = false, input, expected} = {}) {
    await spec.setWindowRect(browser, input)
    let rect
    if (legacy) {
      const {x, y} = await browser.getWindowPosition()
      const {width, height} = await browser.getWindowSize()
      rect = {x, y, width, height}
    } else {
      rect = await browser.getWindowRect()
    }
    assert.deepStrictEqual(rect, expected)
  }
  async function getOrientation({expected} = {}) {
    const result = await spec.getOrientation(browser)
    assert.strictEqual(result, expected)
  }
  async function getSessionId() {
    const expected = browser.sessionId
    const {sessionId} = await spec.getDriverInfo(browser)
    assert.deepStrictEqual(sessionId, expected)
  }
  async function getTitle() {
    const expected = await browser.getTitle()
    const result = await spec.getTitle(browser)
    assert.deepStrictEqual(result, expected)
  }
  async function getUrl() {
    const result = await spec.getUrl(browser)
    assert.deepStrictEqual(result, url)
  }
  async function visit() {
    const blank = 'about:blank'
    await spec.visit(browser, blank)
    const actual = await browser.getUrl()
    assert.deepStrictEqual(actual, blank)
    await browser.url(url)
  }
  async function isMobile({expected} = {}) {
    const {isMobile} = await spec.getDriverInfo(browser)
    assert.deepStrictEqual(isMobile, expected)
  }
  async function isNative({expected} = {}) {
    const {isNative} = await spec.getDriverInfo(browser)
    assert.strictEqual(isNative, expected)
  }
  async function getDeviceName({expected} = {}) {
    const {deviceName} = await spec.getDriverInfo(browser)
    assert.strictEqual(deviceName, expected)
  }
  async function getPlatformName({expected} = {}) {
    const {platformName} = await spec.getDriverInfo(browser)
    assert.strictEqual(platformName, expected)
  }
  async function getPlatformVersion({expected} = {}) {
    const {platformVersion} = await spec.getDriverInfo(browser)
    assert.strictEqual(platformVersion, expected)
  }
})
