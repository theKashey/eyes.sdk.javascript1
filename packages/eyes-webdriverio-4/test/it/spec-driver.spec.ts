import type {Location, Size, Cookie} from '@applitools/types'
import assert from 'assert'
import * as spec from '../../src/spec-driver'
import {By} from '../../src/legacy'

function extractElementId(element) {
  return element.value
    ? element.value['ELEMENT'] ?? element.value['element-6066-11e4-a52e-4f735466cecf']
    : element['ELEMENT'] ?? element['element-6066-11e4-a52e-4f735466cecf']
}

async function equalElements(browser: spec.Driver, element1: spec.Element, element2: spec.Element): Promise<boolean> {
  const result = await browser
    .execute((element1, element2) => element1 === element2, element1, element2)
    .catch(() => ({value: false}))
  return result.value
}

describe('spec driver', async () => {
  let browser: spec.Driver, destroyBrowser: () => void
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'chrome'})
      await browser.url(url)
    })

    after(async () => {
      await destroyBrowser()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: browser, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await browser.element('div').then(({value}) => value), expected: true})
    })
    it('isElement(response-element)', async () => {
      await isElement({input: await browser.element('div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(by)', async () => {
      await isSelector({input: By.xpath('//div'), expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformElement(element)', async () => {
      await transformElement({input: await browser.element('div').then(({value}) => value)})
    })
    it('transformElement(response-element)', async () => {
      await transformElement({input: await browser.element('div')})
    })
    it('transformSelector(string)', async () => {
      await transformSelector({input: '.element', expected: '.element'})
    })
    it('transformSelector(by)', async () => {
      const by = By.xpath('//element')
      await transformSelector({input: by, expected: by})
    })
    it('transformSelector(common-selector)', async () => {
      await transformSelector({input: {selector: '.element', type: 'css'}, expected: 'css selector:.element'})
    })
    it('extractSelector(element)', async () => {
      await extractSelector({input: await browser.element('div').then(({value}) => value), expected: undefined})
    })
    it('extractSelector(response-element)', async () => {
      await extractSelector({input: await browser.element('div'), expected: 'div'})
    })
    it('isEqualElements(element, element)', async () => {
      await isEqualElements({
        input: await browser.element('div').then(({value}) => ({element1: value, element2: value})),
        expected: true,
      })
    })
    it('isEqualElements(element1, element2)', async () => {
      await isEqualElements({
        input: {
          element1: await browser.element('div').then(({value}) => value),
          element2: await browser.element('h1').then(({value}) => value),
        },
        expected: false,
      })
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
      await findElement({input: {selector: '#overflowing-div'}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: 'non-existent'}, expected: null})
    })
    it('findElement(within-element)', async () => {
      await findElement({
        input: {selector: 'div', parent: await browser.element('#stretched').then(({value}) => value)},
      })
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: 'div'}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: 'non-existent'}, expected: []})
    })
    it('findElements(within-element)', async () => {
      await findElements({
        input: {selector: 'div', parent: await browser.element('#stretched').then(({value}) => value)},
      })
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
    it('getDriverInfo()', async () => {
      await getDriverInfo({
        expected: {
          browserName: 'chrome',
          isMobile: false,
          isNative: false,
        },
      })
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

  describe('legacy browser (@webdriver)', async () => {
    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'ie-11'})
    })

    after(async () => {
      await destroyBrowser()
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
          browserVersion: '11.285',
          isMobile: false,
          isNative: false,
          platformName: 'Windows 10',
        },
      })
    })
  })

  describe('mobile browser (@mobile)', async () => {
    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
      await browser.url(url)
    })

    after(async () => {
      await destroyBrowser()
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getCookies(context)', async () => {
      await getCookies({input: {context: true}})
    })
    it('getDriverInfo()', async () => {
      await getDriverInfo({
        expected: {
          browserName: 'chrome',
          deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
          isMobile: true,
          isNative: false,
          platformName: 'Android',
          platformVersion: '10.0',
        },
      })
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'portrait'})
    })
  })

  describe('native app (@mobile @native)', async () => {
    before(async () => {
      ;[browser, destroyBrowser] = await spec.build({
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
        device: 'Pixel 3a XL',
        orientation: 'landscape',
      })
    })

    after(async () => {
      await destroyBrowser()
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'landscape'})
    })
    it('getDriverInfo()', async () => {
      await getDriverInfo({
        expected: {
          deviceName: 'Google Pixel 3a XL GoogleAPI Emulator',
          isMobile: true,
          isNative: true,
          platformName: 'Android',
          platformVersion: '10.0',
          pixelRatio: 2.5,
          statusBarHeight: 60,
          navigationBarHeight: 1080,
        },
      })
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
    const result = await spec.isEqualElements(browser, input.element1, input.element2)
    assert.deepStrictEqual(result, expected)
  }
  async function transformElement({input}: {input: spec.Element}) {
    const result = spec.transformElement(input)
    const elementId = extractElementId(input)
    assert.deepStrictEqual(result, {
      ELEMENT: elementId,
      'element-6066-11e4-a52e-4f735466cecf': elementId,
    })
  }
  async function transformSelector({input, expected}: {input: any; expected: spec.Selector}) {
    const result = spec.transformSelector(input)
    assert.deepStrictEqual(result, expected)
  }
  async function extractSelector({input, expected}: {input: spec.Element; expected: spec.Selector}) {
    const result = spec.extractSelector(input)
    assert.deepStrictEqual(result, expected)
  }
  async function executeScript() {
    const element = await browser.element('html').then(({value}) => value)
    const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
    const [resultElement, ...resultArgs] = await spec.executeScript(browser, 'return arguments[0]', [element, ...args])
    assert.deepStrictEqual(resultArgs, args)
    assert.ok(await equalElements(browser, resultElement, element))
  }
  async function mainContext() {
    try {
      const {value: mainDocument} = await browser.element('html')
      await browser.frame(await browser.element('[name="frame1"]').then(({value}) => value))
      await browser.frame(await browser.element('[name="frame1-1"]').then(({value}) => value))
      const {value: frameDocument} = await browser.element('html')
      assert.ok(!(await equalElements(browser, mainDocument, frameDocument)))
      await spec.mainContext(browser)
      const {value: resultDocument} = await browser.element('html')
      assert.ok(await equalElements(browser, resultDocument, mainDocument))
    } finally {
      await browser.frame(null).catch(() => null)
    }
  }
  async function parentContext() {
    try {
      await browser.frame(await browser.element('[name="frame1"]').then(({value}) => value))
      const {value: parentDocument} = await browser.element('html')
      await browser.frame(await browser.element('[name="frame1-1"]').then(({value}) => value))
      const {value: frameDocument} = await browser.element('html')
      assert.ok(!(await equalElements(browser, parentDocument, frameDocument)))
      await spec.parentContext(browser)
      const {value: resultDocument} = await browser.element('html')
      assert.ok(await equalElements(browser, resultDocument, parentDocument))
    } finally {
      await browser.frame(null).catch(() => null)
    }
  }
  async function childContext() {
    try {
      const {value: element} = await browser.element('[name="frame1"]')
      await browser.frame(element)
      const {value: expectedDocument} = await browser.element('html')
      await browser.frame(null)
      await spec.childContext(browser, element)
      const {value: resultDocument} = await browser.element('html')
      assert.ok(await equalElements(browser, resultDocument, expectedDocument))
    } finally {
      await browser.frame(null).catch(() => null)
    }
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element
  }) {
    const selector = input.selector instanceof By ? input.selector.toString() : input.selector
    expected =
      expected === undefined
        ? input.parent
          ? await browser.elementIdElement(extractElementId(input.parent), selector).then(({value}) => value)
          : await browser.element(selector).then(({value}) => value)
        : expected
    const element = await spec.findElement(browser, input.selector, input.parent)
    if (element !== expected) {
      assert.ok(await equalElements(browser, element, expected))
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element[]
  }) {
    const selector = input.selector instanceof By ? input.selector.toString() : input.selector
    expected =
      expected === undefined
        ? input.parent
          ? await browser.elementIdElements(extractElementId(input.parent), selector).then(({value}) => value)
          : await browser.elements(selector).then(({value}) => value)
        : expected
    const elements = await spec.findElements(browser, input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(browser, element, expected[index]))
    }
  }
  async function getWindowSize() {
    const size = await (browser.windowHandleSize() as Promise<{value: Size}>).then(({value}) => ({
      width: value.width,
      height: value.height,
    }))
    const result = await spec.getWindowSize(browser)
    assert.deepStrictEqual(result, size)
  }
  async function setWindowSize({input}: {input: Size}) {
    await spec.setWindowSize(browser, input)
    const {x, y} = await (browser.windowHandlePosition() as Promise<{value: Location}>).then(({value}) => value)
    const {width, height} = await (browser.windowHandleSize() as Promise<{value: Size}>).then(({value}) => value)
    const rect = {x, y, width, height}
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
      await browser.setCookie(cookie)
    } else {
      const request = {...cookie, expires: cookie.expiry}
      await (browser as any).requestHandler.create(
        {method: 'POST', path: '/session/:sessionId/chromium/send_command_and_get_result'},
        {cmd: 'Network.setCookie', params: request},
      )
    }
    const result = await spec.getCookies(browser, input?.context)
    assert.deepStrictEqual(result, [cookie])
  }
  async function getDriverInfo({expected}: {expected: Record<string, any>}) {
    const info = await spec.getDriverInfo(browser)
    assert.deepStrictEqual(
      Object.keys(expected).reduce((obj, key) => ({...obj, [key]: info[key]}), {}),
      expected,
    )
  }
  async function getOrientation({expected}: {expected: string}) {
    const result = await spec.getOrientation(browser)
    assert.strictEqual(result, expected)
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
})
