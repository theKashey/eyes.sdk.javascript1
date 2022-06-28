import type {Size, Cookie} from '@applitools/types'
import assert from 'assert'
import * as spec from '../../src/spec-driver'

function isEqualElements(frame: spec.Context | spec.Driver, element1: spec.Element, element2: spec.Element) {
  return frame.evaluate((element1, element2) => element1 === element2, element1, element2).catch(() => false)
}

describe('spec driver', async () => {
  let page: spec.Driver, destroyPage: () => void
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop (@chrome)', async () => {
    before(async () => {
      ;[page, destroyPage] = await spec.build({browser: 'chrome', headless: true})
      await page.goto(url)
    })

    after(async () => {
      await destroyPage()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: page, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await page.$('div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformSelector(string)', async () => {
      await transformSelector({input: '.element', expected: '.element'})
    })
    it('transformSelector(common-selector)', async () => {
      await transformSelector({input: {type: 'xpath', selector: '//element'}, expected: '//element'})
    })
    it('isStaleElementError(err)', async () => {
      await isStaleElementError()
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
    it('findElement(selector)', async () => {
      await findElement({input: {selector: '#overflowing-div'}})
    })
    it('findElement(selector, parent-element)', async () => {
      await findElement({input: {selector: 'div', parent: await page.$('#stretched')}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: 'non-existent'}, expected: null})
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: 'div'}})
    })
    it('findElements(string, parent-element)', async () => {
      await findElements({input: {selector: 'div', parent: await page.$('#stretched')}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: 'non-existent'}, expected: []})
    })
    it('getViewportSize()', async () => {
      await getViewportSize()
    })
    it('setViewportSize({width, height})', async () => {
      await setViewportSize({input: {width: 501, height: 502}})
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
    it('visit()', async () => {
      await visit()
    })
  })

  describe('headless desktop (@firefox)', async () => {
    before(async () => {
      ;[page, destroyPage] = await spec.build({browser: 'firefox', headless: true})
      await page.goto(url)
    })

    after(async () => {
      await destroyPage()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: page, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await page.$('div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformSelector(string)', async () => {
      await transformSelector({input: '.element', expected: '.element'})
    })
    it('transformSelector(common-selector)', async () => {
      await transformSelector({input: {type: 'xpath', selector: '//element'}, expected: '//element'})
    })
    it('isStaleElementError(err)', async () => {
      await isStaleElementError()
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
    it('findElement(selector)', async () => {
      await findElement({input: {selector: '#overflowing-div'}})
    })
    it('findElement(selector, parent-element)', async () => {
      await findElement({input: {selector: 'div', parent: await page.$('#stretched')}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: 'non-existent'}, expected: null})
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: 'div'}})
    })
    it('findElements(string, parent-element)', async () => {
      await findElements({input: {selector: 'div', parent: await page.$('#stretched')}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: 'non-existent'}, expected: []})
    })
    it('getViewportSize()', async () => {
      await getViewportSize()
    })
    it('setViewportSize({width, height})', async () => {
      await setViewportSize({input: {width: 501, height: 502}})
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
    it('visit()', async () => {
      await visit()
    })
  })

  async function isDriver({input, expected}: {input: spec.Driver; expected: boolean}) {
    const result = spec.isDriver(input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}: {input: spec.Element; expected: boolean}) {
    const result = spec.isElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: spec.Selector; expected: boolean}) {
    const result = spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function transformSelector({input, expected}: {input: any; expected: spec.Selector}) {
    const result = spec.transformSelector(input)
    assert.deepStrictEqual(result, expected || input)
  }
  async function isStaleElementError() {
    const element = await page.$('#overflowing-div')
    await page.reload()
    try {
      await element.click()
    } catch (err) {
      return assert.ok(spec.isStaleElementError(err))
    }
    assert.fail()
  }
  async function executeScript() {
    const num = 0
    const str = 'string'
    const obj = {key: 'value', obj: {key: 0}}
    const arr = [0, 1, 2, {key: 3}]
    const el = await page.$('div')
    const result = await spec.executeScript(page.mainFrame(), arg => arg, {num, str, obj, arr, el})
    assert.strictEqual(result.num, num)
    assert.strictEqual(result.str, str)
    assert.deepStrictEqual(result.obj, obj)
    assert.deepStrictEqual(result.arr, arr)
    assert.ok(await isEqualElements(page, result.el, el))
  }
  async function mainContext() {
    const mainDocument = await page.$('html')
    const frame1 = await page
      .mainFrame()
      .childFrames()
      .find(frame => frame.name() === 'frame1')
    const frame2 = await frame1.childFrames().find(frame => frame.name() === 'frame1-1')
    const frameDocument = await frame2.$('html')
    assert.ok(!(await isEqualElements(frame2, mainDocument, frameDocument)))
    const mainFrame = await spec.mainContext(frame2)
    const resultDocument = await mainFrame.$('html')
    assert.ok(await isEqualElements(mainFrame, resultDocument, mainDocument))
  }
  async function parentContext() {
    const frame1 = await page
      .mainFrame()
      .childFrames()
      .find(frame => frame.name() === 'frame1')
    const parentDocument = await frame1.$('html')
    const frame2 = await frame1.childFrames().find(frame => frame.name() === 'frame1-1')
    const frameDocument = await frame2.$('html')
    assert.ok(!(await isEqualElements(frame2, parentDocument, frameDocument)))
    const parentFrame = await spec.parentContext(frame2)
    const resultDocument = await parentFrame.$('html')
    assert.ok(await isEqualElements(parentFrame, resultDocument, parentDocument))
  }
  async function childContext() {
    const element = await page.$('[name="frame1"]')
    const expectedFrame = await element.contentFrame()
    const expectedDocument = await expectedFrame.$('html')
    const resultFrame = await spec.childContext(page.mainFrame(), element)
    const resultDocument = await resultFrame.$('html')
    assert.ok(await isEqualElements(resultFrame, resultDocument, expectedDocument))
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element
  }) {
    const root = input.parent ?? page
    expected = expected === undefined ? await root.$(input.selector) : expected
    const element = await spec.findElement(page.mainFrame(), input.selector, input.parent)
    if (element !== expected) {
      assert.ok(await isEqualElements(page, element, expected))
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element[]
  }) {
    const root = input.parent ?? page
    expected = expected === undefined ? await root.$$(input.selector) : expected
    const elements = await spec.findElements(page.mainFrame(), input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await isEqualElements(page, element, expected[index]))
    }
  }
  async function getViewportSize() {
    const expected = await page.viewport()
    const result = await spec.getViewportSize(page)
    assert.deepStrictEqual(result, expected)
  }
  async function setViewportSize({input}: {input: Size}) {
    await spec.setViewportSize(page, input)
    const actual = page.viewport()
    assert.deepStrictEqual(actual, input)
  }
  async function getCookies() {
    const cookie: Cookie = {
      name: 'hello',
      value: 'world',
      domain: 'google.com',
      path: '/',
      expiry: 4025208067,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    }
    await page.setCookie({...cookie, expires: cookie.expiry})
    const cookies = await spec.getCookies(page)
    assert.deepStrictEqual(cookies, [cookie])
  }
  async function getTitle() {
    const expected = await page.title()
    const result = await spec.getTitle(page)
    assert.deepStrictEqual(result, expected)
  }
  async function getUrl() {
    const result = await spec.getUrl(page)
    assert.deepStrictEqual(result, url)
  }
  async function visit() {
    const blank = 'about:blank'
    await spec.visit(page, blank)
    const actual = await page.url()
    assert.deepStrictEqual(actual, blank)
    await page.goto(url)
  }
})
