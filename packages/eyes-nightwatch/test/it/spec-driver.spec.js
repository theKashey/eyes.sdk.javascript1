const assert = require('assert')
const spec = require('../../dist/spec-driver')

function extractElementId(element) {
  return element.value
    ? element.value['ELEMENT'] || element.value['element-6066-11e4-a52e-4f735466cecf']
    : element['ELEMENT'] || element['element-6066-11e4-a52e-4f735466cecf']
}

async function equalElements(driver, element1, element2) {
  return driver
    .execute((element1, element2) => element1 === element2, [element1, element2])
    .then(result => (result.error ? false : result.value))
    .catch(() => false)
}

describe('spec driver', async () => {
  let driver, destroyDriver
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.url(url)
    })

    after(async () => {
      await destroyDriver()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {}, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await driver.element('css selector', 'div').then(({value}) => value), expected: true})
    })
    it('isElement(response-element)', async () => {
      await isElement({input: await driver.element('css selector', 'div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {}, expected: false})
    })
    it('isSelector({locateStrategy, selector})', async () => {
      await isSelector({input: {locateStrategy: 'css selector', selector: 'div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {}, expected: false})
    })
    it('transformElement(element)', async () => {
      await transformElement({input: await driver.element('css selector', 'div').then(({value}) => value)})
    })
    it('transformElement(response-element)', async () => {
      await transformElement({input: await driver.element('css selector', 'div')})
    })
    it('transformSelector({locateStrategy, selector})', async () => {
      const selector = {locateStrategy: 'css selector', selector: 'div'}
      await transformSelector({input: selector, expected: selector})
    })
    it('transformSelector(string)', async () => {
      await transformSelector({input: '.element', expected: {locateStrategy: 'css selector', selector: '.element'}})
    })
    it('transformSelector(common-selector)', async () => {
      await transformSelector({
        input: {selector: '.element', type: 'css'},
        expected: {locateStrategy: 'css selector', selector: '.element'},
      })
    })
    it('isEqualElements(element, element)', async () => {
      await isEqualElements({
        input: await driver.element('css selector', 'div').then(({value}) => ({element1: value, element2: value})),
        expected: true,
      })
    })
    it('isEqualElements(element1, element2)', async () => {
      await isEqualElements({
        input: {
          element1: await driver.element('css selector', 'div').then(({value}) => value),
          element2: await driver.element('css selector', 'h1').then(({value}) => value),
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
    it('findElement({locateStrategy, selector})', async () => {
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: '#overflowing-div'}}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'non-existent'}}, expected: null})
    })
    it('findElement(within-element)', async () => {
      await findElement({
        input: {
          selector: {locateStrategy: 'css selector', selector: 'div'},
          parent: await driver.element('css selector', '#stretched').then(({value}) => value),
        },
      })
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'non-existent'}}, expected: []})
    })
    it('findElements(within-element)', async () => {
      await findElements({
        input: {
          selector: {locateStrategy: 'css selector', selector: 'div'},
          parent: await driver.element('css selector', '#stretched').then(({value}) => value),
        },
      })
    })
    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 551, height: 552}})
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

  describe('legacy browser (@webdriver)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'ie-11'})
    })

    after(async () => {
      await destroyDriver()
    })

    it('getWindowSize()', async () => {
      await getWindowSize({legacy: true})
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 551, height: 552}, legacy: true})
    })
  })

  describe('mobile browser (@mobile)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
      await driver.url(url)
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
  })

  describe('native app (@mobile @native)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
        device: 'Pixel 3a XL',
        orientation: 'landscape',
      })
    })

    after(async () => {
      await destroyDriver()
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
  })

  async function isDriver({input, expected}) {
    const result = await spec.isDriver(input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}) {
    const result = await spec.isElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}) {
    const result = await spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function isEqualElements({input, expected}) {
    const result = await spec.isEqualElements(driver, input.element1, input.element2)
    assert.deepStrictEqual(result, expected)
  }
  async function transformElement({input}) {
    const result = spec.transformElement(input)
    const elementId = extractElementId(input)
    assert.deepStrictEqual(result, {
      ELEMENT: elementId,
      'element-6066-11e4-a52e-4f735466cecf': elementId,
    })
  }
  async function transformSelector({input, expected}) {
    const result = spec.transformSelector(input)
    assert.deepStrictEqual(result, expected)
  }
  async function executeScript() {
    const element = await driver.element('css selector', 'html').then(({value}) => value)
    const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
    const [resultElement, ...resultArgs] = await spec.executeScript(driver, 'return arguments[0]', [element, ...args])
    assert.deepStrictEqual(resultArgs, args)
    assert.ok(await equalElements(driver, resultElement, element))
  }
  async function mainContext() {
    try {
      const {value: mainDocument} = await driver.element('css selector', 'html')
      await driver.frame(await driver.element('css selector', '[name="frame1"]').then(({value}) => value))
      await driver.frame(await driver.element('css selector', '[name="frame1-1"]').then(({value}) => value))
      const {value: frameDocument} = await driver.element('css selector', 'html')
      assert.ok(!(await equalElements(driver, mainDocument, frameDocument)))
      await spec.mainContext(driver)
      const {value: resultDocument} = await driver.element('css selector', 'html')
      assert.ok(await equalElements(driver, resultDocument, mainDocument))
    } finally {
      await driver.frame(null).catch(() => null)
    }
  }
  async function parentContext() {
    try {
      await driver.frame(await driver.element('css selector', '[name="frame1"]').then(({value}) => value))
      const {value: parentDocument} = await driver.element('css selector', 'html')
      await driver.frame(await driver.element('css selector', '[name="frame1-1"]').then(({value}) => value))
      const {value: frameDocument} = await driver.element('css selector', 'html')
      assert.ok(!(await equalElements(driver, parentDocument, frameDocument)))
      await spec.parentContext(driver)
      const {value: resultDocument} = await driver.element('css selector', 'html')
      assert.ok(await equalElements(driver, resultDocument, parentDocument))
    } finally {
      await driver.frame(null).catch(() => null)
    }
  }
  async function childContext() {
    try {
      const {value: element} = await driver.element('css selector', '[name="frame1"]')
      await driver.frame(element)
      const {value: expectedDocument} = await driver.element('css selector', 'html')
      await driver.frame(null)
      await spec.childContext(driver, element)
      const {value: resultDocument} = await driver.element('css selector', 'html')
      assert.ok(await equalElements(driver, resultDocument, expectedDocument))
    } finally {
      await driver.frame(null).catch(() => null)
    }
  }
  async function findElement({input, expected}) {
    expected =
      expected === undefined
        ? input.parent
          ? await new Promise(resolve =>
              driver.elementIdElement(
                extractElementId(input.parent),
                input.selector.locateStrategy,
                input.selector.selector,
                resolve,
              ),
            ).then(({value}) => value)
          : await driver.element(input.selector.locateStrategy, input.selector.selector).then(({value}) => value)
        : expected
    const element = await spec.findElement(driver, input.selector, input.parent)
    if (element !== expected) {
      assert.ok(await equalElements(driver, element, expected))
    }
  }
  async function findElements({input, expected}) {
    expected =
      expected === undefined
        ? input.parent
          ? await new Promise(resolve =>
              driver.elementIdElements(
                extractElementId(input.parent),
                input.selector.locateStrategy,
                input.selector.selector,
                resolve,
              ),
            ).then(({value}) => value)
          : await driver.elements(input.selector.locateStrategy, input.selector.selector).then(({value}) => value)
        : expected
    const elements = await spec.findElements(driver, input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(driver, element, expected[index]))
    }
  }
  async function getWindowSize({legacy} = {}) {
    let size
    if (legacy) {
      const {width, height} = await driver.getWindowSize()
      size = {width, height}
    } else {
      const {width, height} = await driver.getWindowRect()
      size = {width, height}
    }
    const result = await spec.getWindowSize(driver)
    assert.deepStrictEqual(result, size)
  }
  async function setWindowSize({input, legacy}) {
    await spec.setWindowSize(driver, input)
    let rect
    if (legacy) {
      const {width, height} = await driver.getWindowSize()
      const {x, y} = await driver.getWindowPosition()
      rect = {x, y, width, height}
    } else {
      const {x, y, width, height} = await driver.getWindowRect()
      rect = {x, y, width, height}
    }
    assert.deepStrictEqual(rect, {x: 0, y: 0, ...input})
  }
  async function getCookies({input} = {}) {
    const cookie = {
      name: 'hello',
      value: 'world',
      domain: input && input.context ? '.applitools.github.io' : 'google.com',
      path: '/',
      expiry: 4025208067,
      httpOnly: true,
      secure: true,
    }
    let inputContext
    if (input && input.context) {
      inputContext = input.context
      await driver.setCookie(cookie)
    }
    const result = await spec.getCookies(driver, inputContext)
    assert.deepStrictEqual(result, [cookie])
  }
  async function getTitle() {
    const expected = await driver.title().then(({value}) => value)
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
    const actual = await driver.url().then(({value}) => value)
    assert.deepStrictEqual(actual, blank)
    await driver.url(url)
  }
})
