import type {Size, DriverInfo} from '@applitools/types'
import type {ProtractorBy} from 'protractor'
import assert from 'assert'
import * as spec from '../../src/spec-driver'

describe('spec driver', async () => {
  let driver: spec.Driver, destroyDriver: () => void
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.get(url)
    })

    after(async () => {
      await destroyDriver()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await driver.findElement({css: 'div'}), expected: true})
    })
    it('isElement(element-finder)', async () => {
      await isElement({input: await driver.element({css: 'div'}), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector(by)', async () => {
      await isSelector({input: driver.by.xpath('//div'), expected: true})
    })
    it('isSelector(by-hash)', async () => {
      await isSelector({input: {xpath: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformSelector(by)', async () => {
      const by = driver.by.css('div')
      await transformSelector({input: by, expected: by})
    })
    it('transformSelector(string)', async () => {
      await transformSelector({input: '.element', expected: {css: '.element'}})
    })
    it('transformSelector(common-selector)', async () => {
      await transformSelector({input: {selector: '.element', type: 'css'}, expected: {css: '.element'}})
    })
    it('isEqualElements(element, element)', async () => {
      const element = await driver.findElement({css: 'div'})
      await isEqualElements({input: {element1: element, element2: element}, expected: true})
    })
    it('isEqualElements(element1, element2)', async () => {
      await isEqualElements({
        input: {element1: await driver.findElement({css: 'div'}), element2: await driver.findElement({css: 'h1'})},
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
    it('findElement(selector)', async () => {
      await findElement({input: {selector: {css: '#overflowing-div'}}})
    })
    it('findElement(selector, parent-element)', async () => {
      await findElement({input: {selector: {css: 'div'}, parent: await driver.findElement({css: '#stretched'})}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {css: 'non-existent'}}, expected: null})
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: {css: 'div'}}})
    })
    it('findElements(string, parent-element)', async () => {
      await findElements({input: {selector: {css: 'div'}, parent: await driver.findElement({css: '#stretched'})}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {css: 'non-existent'}}, expected: []})
    })
    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 551, height: 552}})
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
    it('getDriverInfo()', async () => {
      await getDriverInfo({
        expected: {
          browserName: 'chrome',
          isMobile: false,
          isNative: false,
          platformName: 'LINUX',
        },
      })
    })
  })

  describe('headless desktop (@angular)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.get('https://applitools.github.io/demo/TestPages/AngularPage/')
      await driver.waitForAngular()
    })

    after(async () => {
      await destroyDriver()
    })

    it('findElement(by-ng)', async () => {
      await findElement({input: {selector: driver.by.model('name')}})
    })
    it('findElements(by-ng)', async () => {
      await findElements({input: {selector: driver.by.model('name')}})
    })
  })

  describe('legacy driver', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'ie-11', legacy: true})
    })

    after(async () => {
      await destroyDriver()
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 551, height: 552}})
    })
    it('getDriverInfo()', async () => {
      await getDriverInfo({
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

  describe('mobile driver (@mobile @android)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
      await driver.get(url)
    })

    after(async () => {
      await destroyDriver()
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getCookies(context)', async () => {
      await getCookies({input: {context: true}})
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'portrait'})
    })
    it('getDriverInfo()', async () => {
      await getDriverInfo({
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

  async function isDriver({input, expected}: {input: spec.Driver; expected: boolean}) {
    const result = await spec.isDriver(input || driver)
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
  async function transformSelector({input, expected}: {input: any; expected: spec.Selector}) {
    const result = spec.transformSelector(input)
    assert.deepStrictEqual(result, expected || input)
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
  async function executeScript() {
    const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
    const expected = await driver.executeScript('return arguments[0]', args)
    const result = await spec.executeScript(driver, 'return arguments[0]', args)
    assert.deepStrictEqual(result, expected)
  }
  async function mainContext() {
    try {
      const mainDocument = await driver.findElement({css: 'html'})
      await driver.switchTo().frame(await driver.findElement({css: '[name="frame1"]'}))
      await driver.switchTo().frame(await driver.findElement({css: '[name="frame1-1"]'}))
      const frameDocument = await driver.findElement({css: 'html'})
      assert.ok(!(await spec.isEqualElements(driver, mainDocument, frameDocument)))
      await spec.mainContext(driver)
      const resultDocument = await driver.findElement({css: 'html'})
      assert.ok(await spec.isEqualElements(driver, resultDocument, mainDocument))
    } finally {
      await driver
        .switchTo()
        .defaultContent()
        .catch(() => null)
    }
  }
  async function parentContext() {
    try {
      await driver.switchTo().frame(await driver.findElement({css: '[name="frame1"]'}))
      const parentDocument = await driver.findElement({css: 'html'})
      await driver.switchTo().frame(await driver.findElement({css: '[name="frame1-1"]'}))
      const frameDocument = await driver.findElement({css: 'html'})
      assert.ok(!(await spec.isEqualElements(driver, parentDocument, frameDocument)))
      await spec.parentContext(driver)
      const resultDocument = await driver.findElement({css: 'html'})
      assert.ok(await spec.isEqualElements(driver, resultDocument, parentDocument))
    } finally {
      await driver
        .switchTo()
        .frame(null)
        .catch(() => null)
    }
  }
  async function childContext() {
    try {
      const element = await driver.findElement({css: '[name="frame1"]'})
      await driver.switchTo().frame(element)
      const expectedDocument = await driver.findElement({css: 'html'})
      await driver.switchTo().frame(null)
      await spec.childContext(driver, element)
      const resultDocument = await driver.findElement({css: 'html'})
      assert.ok(await spec.isEqualElements(driver, resultDocument, expectedDocument))
    } finally {
      await driver
        .switchTo()
        .frame(null)
        .catch(() => null)
    }
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element
  }) {
    const root = input.parent ?? driver
    expected = expected === undefined ? await root.findElement(input.selector as ProtractorBy) : expected
    const element = await spec.findElement(driver, input.selector, input.parent)
    if (element !== expected) {
      assert.ok(await spec.isEqualElements(driver, element, expected))
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element[]
  }) {
    const root = input.parent ?? driver
    expected = expected === undefined ? await root.findElements(input.selector as ProtractorBy) : expected
    const elements = await spec.findElements(driver, input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await spec.isEqualElements(driver, element, expected[index]))
    }
  }
  async function getWindowSize() {
    const size = await driver.manage().window().getSize()
    const result = await spec.getWindowSize(driver)
    assert.deepStrictEqual(result, {width: size.width, height: size.height})
  }
  async function setWindowSize({input}: {input: Size}) {
    await spec.setWindowSize(driver, input)
    const {x, y} = await driver.manage().window().getPosition()
    const {width, height} = await driver.manage().window().getSize()
    const rect = {x, y, width, height}
    assert.deepStrictEqual(rect, {x: 0, y: 0, ...input})
  }
  async function getCookies({input}: {input?: {context: boolean}} = {}) {
    const cookie = {
      name: 'hello',
      value: 'world',
      domain: input?.context ? '.applitools.github.io' : 'google.com',
      path: '/',
      expiry: 4025208067,
      httpOnly: true,
      secure: true,
    }
    if (input?.context) {
      await driver.manage().addCookie(cookie)
    } else {
      await driver.driver.sendChromiumCommandAndGetResult('Network.setCookie', {...cookie, expires: cookie.expiry})
    }
    const result = await spec.getCookies(driver, input?.context)
    assert.deepStrictEqual(result, [cookie])
  }
  async function getOrientation({expected}: {expected: 'portrait' | 'landscape'}) {
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
    const actual = await driver.getCurrentUrl()
    assert.deepStrictEqual(actual, blank)
    await driver.get(url)
  }
  async function getDriverInfo({expected}: {expected: Partial<DriverInfo>}) {
    const info = await spec.getDriverInfo(driver)
    assert.deepStrictEqual(
      Object.keys(expected).reduce((obj, key) => ({...obj, [key]: info[key]}), {}),
      expected,
    )
  }
})
