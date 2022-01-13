const assert = require('assert')
const {Selector, ClientFunction} = require('testcafe')
const spec = require('../../dist/spec-driver')

function isEqualElements(t, element1, element2) {
  if (!element1 || !element2) return false
  const compareElements = ClientFunction(() => element1() === element2(), {
    boundTestRun: t,
    dependencies: {element1, element2},
  })
  return compareElements()
}

fixture`spec-driver`.page`https://applitools.github.io/demo/TestPages/FramesTestPage/`

test('isDriver(driver)', driver => {
  assert.strictEqual(spec.isDriver(driver), true)
})
test('isDriver(wrong)', _driver => {
  assert.strictEqual(spec.isDriver({}), false)
})
test('isElement(NodeSnapshot)', async () => {
  const element = await Selector('div')()
  assert.strictEqual(spec.isElement(element), true)
})
test('isElement(Selector)', async () => {
  const element = Selector('div')
  assert.strictEqual(spec.isElement(element), true)
})
test('isElement(wrong)', _driver => {
  assert.strictEqual(spec.isElement({}), false)
})
test('isSelector(Selector)', _driver => {
  assert.strictEqual(spec.isSelector(Selector('div')), true)
})
test('isSelector(wrong)', _driver => {
  assert.strictEqual(spec.isSelector({}), false)
})
test('findElement(string)', async driver => {
  const element = await spec.findElement(driver, '#overflowing-div')
  assert.strictEqual(spec.isElement(element), true)
})
test('findElement({type: css, selector})', async driver => {
  const element = await spec.findElement(driver, {type: 'css', selector: 'div'})
  assert.strictEqual(spec.isElement(element), true)
})
test('findElement({type: xpath, selector})', async driver => {
  const element = await spec.findElement(driver, {type: 'xpath', selector: '//html'})
  assert.strictEqual(spec.isElement(element), true)
})
test('findElement(Selector)', async driver => {
  const element = await spec.findElement(driver, Selector('#overflowing-div'))
  assert.strictEqual(spec.isElement(element), true)
})
test('findElement(non-existent)', async driver => {
  const element = await spec.findElement(driver, 'non-existent')
  assert.strictEqual(element, null)
})
test('findElements(string) - single element returned', async driver => {
  const elements = await spec.findElements(driver, 'html')
  assert.strictEqual(elements.length, 1)
})
test('findElements(string) - multiple elements returned', async driver => {
  const elements = await spec.findElements(driver, 'div')
  assert.ok(elements.length > 1)
  assert.ok(!(await isEqualElements(driver, elements[0], elements[1])))
})
test('findElements(Selector)', async driver => {
  const elements = await spec.findElements(driver, Selector('div'))
  assert.ok(elements.length > 1)
  assert.ok(!(await isEqualElements(driver, elements[0], elements[1])))
})
test('findElements({type: css, selector})', async driver => {
  const elements = await spec.findElements(driver, {type: 'css', selector: 'div'})
  assert.ok(elements.length > 1)
  assert(!(await isEqualElements(driver, elements[0], elements[1])))
})
test('findElements({type: xpath, selector})', async driver => {
  const elements = await spec.findElements(driver, {type: 'xpath', selector: '//div'})
  assert.ok(elements.length > 1)
  assert(!(await isEqualElements(driver, elements[0], elements[1])))
})
test('findElements(non-existent)', async driver => {
  const elements = await spec.findElements(driver, 'non-existent')
  assert.deepStrictEqual(elements, [])
})
test('executeScript(string)', async driver => {
  assert.deepStrictEqual(await spec.executeScript(driver, 'return 4'), 4)
})
test('executeScript(string, {a, b})', async driver => {
  assert.deepStrictEqual(await spec.executeScript(driver, 'return arguments[0].a + arguments[0].b', {a: 4, b: 5}), 9)
})
test('executeScript(function, {a, b})', async driver => {
  const script = function (arg) {
    return arg.a + arg.b
  }
  assert.deepStrictEqual(await spec.executeScript(driver, script, {a: 4, b: 5}), 9)
})
test('executeScript w/ Selector', async driver => {
  const script = 'return arguments[0].style.width'
  const selector = Selector('#overflowing-div')
  assert.deepStrictEqual(await spec.executeScript(driver, script, selector), '300px')
})
test('executeScript re-use returned element', async driver => {
  const result = await spec.executeScript(driver, 'return arguments[0]', Selector('h1'))
  const actual = await spec.executeScript(
    driver,
    "return getComputedStyle(arguments[0]).getPropertyValue('overflow')",
    result,
  )
  assert.deepStrictEqual(actual, 'visible')
})
test('executeScript re-use returned element (when the element changes)', async driver => {
  const expected = 'blah'
  const target = await spec.executeScript(driver, 'return arguments[0]', Selector('h1'))
  await spec.executeScript(driver, `document.querySelector('h1').textContent = '${expected}'`)
  const result = await spec.executeScript(driver, 'return arguments[0]', target)
  const actual = await result.innerText
  assert.deepStrictEqual(actual, expected)
})
test('executeScript return mixed data-types (Array)', async driver => {
  const expected = 2
  const result = await spec.executeScript(driver, 'return [0, arguments[0]]', Selector('h1'))
  const actual = result.length
  assert.deepStrictEqual(actual, expected)
})
test('executeScript return mixed data-types (Object)', async driver => {
  const expected = 2
  const result = await spec.executeScript(driver, "return {element: arguments[0], blah: 'blah'}", Selector('h1'))
  const actual = Object.entries(result).length
  assert.deepStrictEqual(actual, expected)
})
test('executeScript with serialized arguments', async driver => {
  const serializedArgs = [{element: Selector('html')}]
  const fn = function ({element}) {
    return element.style.overflow
  }
  await spec.executeScript(driver, fn, ...serializedArgs)
})
test('mainContext()', async driver => {
  try {
    const isMainContext = ClientFunction(() => window.top === window)
    await driver.switchToIframe('[name="frame1"]')
    await driver.switchToIframe('[name="frame1-1"]')
    assert.ok(!(await isMainContext()))
    await spec.mainContext(driver)
    assert.ok(await isMainContext())
  } finally {
    await driver.switchToMainWindow().catch(() => null)
  }
})
test('childContext(element)', async driver => {
  try {
    const isMainContext = ClientFunction(() => window.top === window)
    await driver.switchToIframe('[name="frame1"]')
    assert.ok(!(await isMainContext()))
    await driver.switchToMainWindow()
    await spec.childContext(driver, Selector('[name="frame1"]'))
    assert.ok(!(await isMainContext()))
  } finally {
    await driver.switchToMainWindow().catch(() => null)
  }
})
test('getTitle()', async driver => {
  const expected = 'Cross SDK test'
  const actual = await spec.getTitle(driver)
  assert.deepStrictEqual(actual, expected)
})
test('getTitle() when not present', async driver => {
  await spec.visit(driver, 'http://applitools.github.io/demo/TestPages/fixed-position')
  const expected = ''
  const actual = await spec.getTitle(driver)
  assert.deepStrictEqual(actual, expected)
})
test('getUrl()', async driver => {
  const expected = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'
  const result = await spec.getUrl(driver)
  assert.deepStrictEqual(result, expected)
})
test('visit()', async driver => {
  let startUrl
  try {
    startUrl = await spec.getUrl(driver)
    const blank = 'about:blank'
    await spec.visit(driver, blank)
    const actual = await spec.getUrl()
    assert.deepStrictEqual(actual, blank)
  } finally {
    await driver.navigateTo(startUrl)
  }
})
test('takeScreenshot', async driver => {
  const screenshot = await spec.takeScreenshot(driver)
  assert.ok(Buffer.isBuffer(screenshot))
})
test('setViewportSize(width, height)', async driver => {
  const expectedRect = {width: 500, height: 500}
  await spec.setViewportSize(driver, expectedRect)
  const actualRect = await driver.eval(() => ({
    width: window.innerWidth, // eslint-disable-line no-undef
    height: window.innerHeight, // eslint-disable-line no-undef
  }))
  assert.deepStrictEqual(actualRect, expectedRect)
})
