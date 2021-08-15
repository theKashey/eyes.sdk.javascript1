const {strict: assert} = require('assert') // eslint-disable-line node/no-unsupported-features/node-builtins

async function checkSpecDriver({spec, driver}) {
  const tests = {
    'execute script with echo snippet': async () => {
      const arg = [1, '23', false, {a: 4, b: [5]}, null]
      const result = await spec.executeScript(driver, 'return arguments[0]', arg)
      assert.deepEqual(result, arg, 'script returns an array of json data')
    },

    'execute script with functional script': async () => {
      const arg = {a: 2, b: 1, c: 7}
      function script(arg) {
        return arg
      }
      const result = await spec.executeScript(driver, script, arg)
      assert.deepEqual(result, arg, 'script returns an array of json data from functional script')
    },

    'execute script with return value of dom element': async () => {
      const element = await spec.executeScript(driver, 'return document.documentElement')
      const isHtmlElement = await spec.executeScript(
        driver,
        'return arguments[0] === document.documentElement',
        element,
      )
      assert.ok(isHtmlElement, 'script returns an element and could be executed with an element')
    },

    'execute script with nested element references': async () => {
      const elements = await spec.executeScript(
        driver,
        'return [{html: document.documentElement, body: document.body}]',
      )
      const isElements = await spec.executeScript(
        driver,
        'return arguments[0][0].html === document.documentElement && arguments[0][0].html === document.documentElement',
        elements,
      )
      assert.ok(
        isElements,
        'script returns elements inside nested structure and could be executed with a nested structure of elements',
      )
    },

    'find element with string selector': async () => {
      const selector = 'html>body>h1'
      const element = await spec.findElement(driver, selector)
      const isWantedElement = await spec.executeScript(
        driver,
        `return arguments[0] === document.querySelector("${selector}")`,
        element,
      )
      assert.ok(isWantedElement, `returns element by string selector - "${selector}"`)
    },

    'find element with spec selector': async () => {
      const cssSelector = {type: 'css', selector: 'html>body>h1'}
      const xpathSelector = {type: 'xpath', selector: '//html/body/h1'}
      const verificationScript = `return arguments[0] === document.querySelector("${cssSelector.selector}")`

      const cssElement = await spec.findElement(driver, cssSelector)
      const isCssElement = await spec.executeScript(driver, verificationScript, cssElement)
      assert.ok(isCssElement, `returns element by spec selector - ${JSON.stringify(cssSelector)}`)

      const xpathElement = await spec.findElement(driver, xpathSelector)
      const isXpathElement = await spec.executeScript(driver, verificationScript, xpathElement)
      assert.ok(isXpathElement, `returns element by spec selector - ${JSON.stringify(xpathSelector)}`)
    },

    'find element with unresolvable selector': async () => {
      const selector = 'unresolvable_selector'
      const element = await spec.findElement(driver, selector)
      assert.equal(element, null, `returns null by unresolvable selector - "${selector}"`)
    },

    'find elements with string selector': async () => {
      const selector = 'html p'
      const elements = await spec.findElements(driver, selector)
      const isExpectedElements = await spec.executeScript(
        driver,
        `var expected = arguments[0]; return Array.prototype.every.call(document.querySelectorAll("${selector}"), function(element, index) { return element === expected[index] })`,
        elements,
      )
      assert.ok(isExpectedElements, `returns elements by string selector - "${selector}"`)
    },

    'find elements with spec selector': async () => {
      const cssSelector = {type: 'css', selector: 'html p'}
      const xpathSelector = {type: 'xpath', selector: '//html//p'}
      const verificationScript = `var expected = arguments[0]; return Array.prototype.every.call(document.querySelectorAll("${cssSelector.selector}"), function(element, index) { return element === expected[index] })`

      const cssElements = await spec.findElements(driver, cssSelector)
      const isCssElements = await spec.executeScript(driver, verificationScript, cssElements)
      assert.ok(isCssElements, `returns elements by spec selector - ${JSON.stringify(cssSelector)}`)

      const xpathElements = await spec.findElements(driver, xpathSelector)
      const isXpathElements = await spec.executeScript(driver, verificationScript, xpathElements)
      assert.ok(isXpathElements, `returns element by spec selector - ${JSON.stringify(xpathSelector)}`)
    },

    'find elements with unresolvable selector': async () => {
      const selector = 'unresolvable_selector'
      const element = await spec.findElements(driver, selector)
      assert.deepEqual(element, [], `returns empty array by unresolvable selector - "${selector}"`)
    },

    'child context': async () => {
      const element = await spec.findElement(driver, '[name="frame1"]')
      const childContext = (await spec.childContext(driver, element)) || driver
      const inFrame = await spec.executeScript(childContext, 'return window.frameElement.name === "frame1"')
      assert.ok(inFrame, 'returns or switches to a child context')
      assert.ok(
        typeof spec.mainContext === 'function',
        'spec.mainContext also needs to be implemented in order to test spec.childContext',
      )
      await spec.mainContext(driver)
    },

    'is equal elements': async () => {
      const htmlEl = await spec.findElement(driver, 'html')
      const htmlEl2 = await spec.executeScript(driver, 'return document.documentElement')
      assert.ok(await spec.isEqualElements(driver, htmlEl, htmlEl2), 'elements should be equal')
      const bodyEl = await spec.executeScript(driver, 'return document.body')
      assert.ok(!(await spec.isEqualElements(driver, htmlEl, bodyEl)), 'elements should not be equal')
      assert.ok(
        !(await spec.isEqualElements(driver, htmlEl, undefined)),
        'isEqualElements should return false if one of the arguments is falsy',
      )
      assert.ok(
        !(await spec.isEqualElements(driver, undefined, htmlEl)),
        'isEqualElements should return false if one of the arguments is falsy',
      )
    },

    'main context': async () => {
      const mainDocument1 = await spec.findElement(driver, 'html')
      const childContext1 =
        (await spec.childContext(driver, await spec.findElement(driver, '[name="frame1"]'))) || driver
      const childContext2 =
        (await spec.childContext(childContext1, await spec.findElement(childContext1, '[name="frame1-1"]'))) || driver
      const frameDocument = await spec.findElement(childContext2, 'html')
      assert.ok(!(await spec.isEqualElements(childContext2, mainDocument1, frameDocument)))
      const mainContext = await spec.mainContext(childContext2)
      const mainDocument2 = await spec.findElement(mainContext, 'html')
      assert.ok(await spec.isEqualElements(mainContext, mainDocument2, mainDocument1))
    },

    'parent context': async () => {
      const parentContext1 =
        (await spec.childContext(driver, await spec.findElement(driver, '[name="frame1"]'))) || driver
      const parentDocument1 = await spec.findElement(parentContext1, 'html')
      const frameContext =
        (await spec.childContext(parentContext1, await spec.findElement(parentContext1, '[name="frame1-1"]'))) || driver
      const frameDocument = await spec.findElement(frameContext, 'html')
      assert.ok(!(await spec.isEqualElements(frameContext, parentDocument1, frameDocument)))
      const parentContext2 = (await spec.parentContext(frameContext)) || driver
      const parentDocument2 = await spec.findElement(parentContext2, 'html')
      assert.ok(await spec.isEqualElements(parentContext2, parentDocument2, parentDocument1))
      await spec.mainContext(driver)
    },

    'get title': async () => {
      const title = await spec.getTitle(driver)
      assert.equal(title, 'Cross SDK test', 'returns title of the current page')
    },

    'get url': async () => {
      const url = await spec.getUrl(driver)
      assert.equal(
        url,
        'https://applitools.github.io/demo/TestPages/FramesTestPage/',
        'returns url of the current page',
      )
    },

    'get driver info': async () => {
      if (!spec.getDriverInfo) return {skipped: true}
      const info = await spec.getDriverInfo(driver)
      const expected = {browserName: 'chrome', isMobile: false, isNative: false}
      assert.deepEqual(
        Object.keys(expected).reduce((obj, key) => ({...obj, [key]: info[key]}), {}),
        expected,
        'returns valid info about the browser',
      )
    },
    'is driver': async () => {
      assert.ok(await spec.isDriver(driver), 'driver should be considered a driver :)')
      assert.ok(!(await spec.isDriver()), 'undefined should not be considered a driver')
      assert.ok(!(await spec.isDriver(3)), 'number should not be considered a driver')
      assert.ok(!(await spec.isDriver('str')), 'string should not be considered a driver')
    },
    'is element': async () => {
      const el = await spec.findElement(driver, 'html')
      assert.ok(await spec.isElement(el), 'element should be considered an element :)')
      assert.ok(!(await spec.isElement()), 'undefined should not be considered an element')
      assert.ok(!(await spec.isElement(3)), 'number should not be considered an element')
      assert.ok(!(await spec.isElement('str')), 'str should not be considered an element')
    },
    // 'is selector': async () => {}, // hard to test this
    // 'set window size': async () => {}, // hard to test this
    // 'get window size': async () => {}, // hard to test this
  }

  const report = []

  await spec.visit(driver, 'https://applitools.github.io/demo/TestPages/FramesTestPage/')

  for (const [test, check] of Object.entries(tests)) {
    try {
      const result = (await check()) || {success: true}
      report.push({test, ...result})
    } catch (error) {
      report.push({test, error: {message: error.message, expected: error.expected, actual: error.actual}})
    }
  }

  return report
}

module.exports = checkSpecDriver
