import type {Size} from '@applitools/types'
import assert from 'assert'
import {By} from 'selenium-webdriver'
import * as spec from '../../src'

describe('spec driver', async () => {
  let driver: spec.Driver, destroyDriver: () => void
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      driver = spec.transformDriver(driver)
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
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector(by)', async () => {
      await isSelector({input: By.xpath('//div'), expected: true})
    })
    it('isSelector(by-hash)', async () => {
      await isSelector({input: {xpath: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformSelector(by)', async () => {
      const by = By.css('div')
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
  })

  describe('legacy driver', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'ie-11', legacy: true})
      driver = spec.transformDriver(driver)
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
  })

  describe('mobile driver (@mobile @android)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
      driver = spec.transformDriver(driver)
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
  })

  describe('mobile driver (@mobile @native @android)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
        device: 'Pixel 3a XL',
        orientation: 'landscape',
      })
      driver = spec.transformDriver(driver)
    })

    after(async () => {
      await destroyDriver()
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'landscape'})
    })

    describe('unconventional service provider', async () => {
      before(async () => {
        ;[driver, destroyDriver] = await spec.build({
          device: 'Perfecto Android native',
        })
        driver = spec.transformDriver(driver)
      })
      it('findElement(non-existent)', async () => {
        await findElement({input: {selector: {xpath: '//non-existent'}}, expected: null})
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
      const mainDocument = await driver.findElement(By.css('html'))
      await driver.switchTo().frame(await driver.findElement(By.css('[name="frame1"]')))
      await driver.switchTo().frame(await driver.findElement(By.css('[name="frame1-1"]')))
      const frameDocument = await driver.findElement(By.css('html'))
      assert.ok(!(await spec.isEqualElements(driver, mainDocument, frameDocument)))
      await spec.mainContext(driver)
      const resultDocument = await driver.findElement(By.css('html'))
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
      await driver.switchTo().frame(await driver.findElement(By.css('[name="frame1"]')))
      const parentDocument = await driver.findElement(By.css('html'))
      await driver.switchTo().frame(await driver.findElement(By.css('[name="frame1-1"]')))
      const frameDocument = await driver.findElement(By.css('html'))
      assert.ok(!(await spec.isEqualElements(driver, parentDocument, frameDocument)))
      await spec.parentContext(driver)
      const resultDocument = await driver.findElement(By.css('html'))
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
      const element = await driver.findElement(By.css('[name="frame1"]'))
      await driver.switchTo().frame(element)
      const expectedDocument = await driver.findElement(By.css('html'))
      await driver.switchTo().frame(null)
      await spec.childContext(driver, element)
      const resultDocument = await driver.findElement(By.css('html'))
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
    expected = expected === undefined ? await root.findElement(input.selector) : expected
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
    expected = expected === undefined ? await root.findElements(input.selector) : expected
    const elements = await spec.findElements(driver, input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await spec.isEqualElements(driver, element, expected[index]))
    }
  }
  async function getWindowSize() {
    let expected
    try {
      const {width, height} = await driver.manage().window().getRect()
      expected = {width, height}
    } catch {
      const {Command} = require('selenium-webdriver/lib/command')
      const {width, height} =
        (await driver.manage().window().getSize?.()) ?? (await driver.execute(new Command('getWindowSize')))
      expected = {width, height}
    }
    const result = await spec.getWindowSize(driver)
    assert.deepStrictEqual(result, expected)
  }
  async function setWindowSize({input}: {input: Size}) {
    await spec.setWindowSize(driver, input)
    let result
    try {
      const {width, height} = await driver.manage().window().getRect()
      result = {width, height}
    } catch {
      const {Command} = require('selenium-webdriver/lib/command')
      const {width, height} =
        (await driver.manage().window().getSize?.()) ?? (await driver.execute(new Command('getWindowSize')))
      result = {width, height}
    }
    assert.deepStrictEqual(result, input)
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
      if ((driver as any).sendAndGetDevToolsCommand) {
        // TODO remove type cast once selenium types include newest method
        await (driver as any).sendAndGetDevToolsCommand('Network.setCookie', {...cookie, expires: cookie.expiry})
      } else {
        const {Command} = require('selenium-webdriver/lib/command')
        const executeCdpCommand = new Command('executeCdp')
          .setParameter('cmd', 'Network.setCookie')
          .setParameter('params', {...cookie, expires: cookie.expiry})
        await (driver as any).schedule(executeCdpCommand)
      }
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
})
