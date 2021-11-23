const assert = require('assert')
const spec = require('../../dist/spec-driver/webdriver')

describe('spec driver', async () => {
  let driver, destroyDriver
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
      await isDriver({expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {}, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: () => driver.findElement('css selector', 'div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: () => ({}), expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector({type, selector})', async () => {
      await isSelector({input: {type: 'css', selector: 'div'}, expected: true})
    })
    it('isSelector({using, value})', async () => {
      await isSelector({input: {using: 'xpath', value: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {}, expected: false})
    })
    // it('transformElement(element)', async () => {
    //   await transformElement({input: () => browser.findElement('css selector', 'div')})
    // })
    // it('transformElement(extended-element)', async () => {
    //   await transformElement({input: () => browser.$('div')})
    // })
    it('isEqualElements(element, element)', async () => {
      await isEqualElements({
        input: () =>
          driver.findElement('css selector', 'div').then(element => ({element1: element, element2: element})),
        expected: true,
      })
    })
    it('isEqualElements(element1, element2)', async () => {
      isEqualElements({
        input: async () => ({
          element1: await browser.findElement('css selector', 'div'),
          element2: await browser.findElement('css selector', 'h1'),
        }),
        expected: false,
      })
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
    it('getTitle()', async () => {
      await getTitle()
    })
    it('getUrl()', async () => {
      await getUrl()
    })
    it('visit()', async () => {
      await visit()
    })
    it('getDeviceInfo()', async () => {
      await getDeviceInfo({
        expected: {
          browserName: 'chrome',
          isMobile: false,
          isNative: false,
          platformName: 'linux',
        },
      })
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
      await setWindowSize({
        input: {width: 551, height: 552},
        expected: {width: 551, height: 552},
      })
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
      await setWindowSize({
        legacy: true,
        input: {width: 551, height: 552},
        expected: {width: 551, height: 552},
      })
    })
    it('getDeviceInfo()', async () => {
      await getDeviceInfo({
        expected: {
          browserName: 'internet explorer',
          browserVersion: '11',
          isMobile: false,
          isNative: false,
          platformName: 'WINDOWS',
        },
      })
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
    it('getDeviceInfo()', async () => {
      await getDeviceInfo({
        expected: {
          browserName: 'chrome',
          deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
          isMobile: true,
          isNative: false,
          platformName: 'Android',
          platformVersion: '10',
        },
      })
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
    it('getDeviceInfo()', async () => {
      await getDeviceInfo({
        expected: {
          deviceName: 'Android Emulator',
          isMobile: true,
          isNative: true,
          platformName: 'Android',
          platformVersion: '6.0',
        },
      })
    })
  })

  async function isDriver({input, expected}) {
    const isDriver = await spec.isDriver(input || driver)
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
    const result = await spec.isEqualElements(driver, element1, element2)
    assert.deepStrictEqual(result, expected)
  }
  // async function transformElement({input}) {
  //   const element = await input()
  //   const elementId = element.elementId || element['element-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
  //   const result = spec.transformElement(element)
  //   assert.deepStrictEqual(result, {
  //     ELEMENT: elementId,
  //     'element-6066-11e4-a52e-4f735466cecf': elementId,
  //   })
  // }
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
  async function findElement({input, expected} = {}) {
    const result =
      expected !== undefined
        ? expected
        : await driver.findElement(input?.using ?? 'css selector', input?.value ?? input)
    const element = await spec.findElement(driver, input)
    if (element !== result) {
      assert.ok(await spec.isEqualElements(driver, element, result))
    }
  }
  async function findElements({input, expected} = {}) {
    const result =
      expected !== undefined
        ? expected
        : await driver.findElements(input?.using ?? 'css selector', input?.value ?? input)
    const elements = await spec.findElements(driver, input)
    assert.strictEqual(elements.length, result.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await spec.isEqualElements(driver, element, result[index]))
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
  async function setWindowSize({legacy = false, input, expected} = {}) {
    await spec.setWindowSize(driver, input)
    let rect
    if (legacy) {
      const {x, y} = await driver.getWindowPosition()
      const {width, height} = await driver._getWindowSize()
      rect = {x, y, width, height}
    } else {
      rect = await driver.getWindowRect()
    }
    assert.deepStrictEqual(rect, {x: 0, y: 0, ...expected})
  }
  async function getOrientation({expected} = {}) {
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
  async function getDeviceInfo({expected} = {}) {
    const info = await spec.getDriverInfo(driver)
    assert.deepStrictEqual(
      Object.keys(expected).reduce((obj, key) => ({...obj, [key]: info[key]}), {}),
      expected,
    )
  }
})
