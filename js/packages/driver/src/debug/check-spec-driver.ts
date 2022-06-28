import type {SpecDriver} from '@applitools/types'
import {strict as assert} from 'assert'

const snippets = require('@applitools/snippets')

export async function checkSpecDriver<TDriver, TContext, TElement, TSelector>(options: {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  driver: TDriver
}) {
  const {spec, driver} = options
  const context = extractContext(driver)

  const tests = {
    'execute script with echo snippet': async () => {
      const arg = [1, '23', false, {a: 4, b: [5]}, null]
      const result = await spec.executeScript(context, 'return arguments[0]', arg)
      assert.deepEqual(result, arg, 'script returns an array of json data')
    },

    'execute script with functional script': async () => {
      const arg = {a: 2, b: 1, c: 7}
      function script(arg: any) {
        return arg
      }
      const result = await spec.executeScript(context, script, arg)
      assert.deepEqual(result, arg, 'script returns an array of json data from functional script')
    },

    'execute script with return value of dom element': async () => {
      const element = await spec.executeScript(context, 'return document.documentElement')
      const isHtmlElement = await spec.executeScript(
        context,
        'return arguments[0] === document.documentElement',
        element,
      )
      assert.ok(isHtmlElement, 'script returns an element and could be executed with an element')
    },

    'execute script with nested element references': async () => {
      const elements = await spec.executeScript(
        context,
        'return [{html: document.documentElement, body: document.body}]',
      )
      const isElements = await spec.executeScript(
        context,
        'return arguments[0][0].html === document.documentElement && arguments[0][0].html === document.documentElement',
        elements,
      )
      assert.ok(
        isElements,
        'script returns elements inside nested structure and could be executed with a nested structure of elements',
      )
    },

    'find element with string selector': async () => {
      const selector = transformSelector('html>body>h1')
      const element = await spec.findElement(context, selector)
      const isWantedElement = await spec.executeScript(
        context,
        `return arguments[0] === document.querySelector("${selector}")`,
        element,
      )
      assert.ok(isWantedElement, `returns element by string selector - "${selector}"`)
    },

    'find element with spec selector': async () => {
      const cssSelector = transformSelector({type: 'css', selector: 'html>body>h1'})
      const xpathSelector = transformSelector({type: 'xpath', selector: '//html/body/h1'})
      const verificationScript = `return arguments[0] === document.querySelector('html>body>h1')`

      const cssElement = await spec.findElement(context, cssSelector)
      const isCssElement = await spec.executeScript(context, verificationScript, cssElement)
      assert.ok(isCssElement, `returns element by spec selector - ${JSON.stringify(cssSelector)}`)

      const xpathElement = await spec.findElement(context, xpathSelector)
      const isXpathElement = await spec.executeScript(context, verificationScript, xpathElement)
      assert.ok(isXpathElement, `returns element by spec selector - ${JSON.stringify(xpathSelector)}`)
    },

    'find element with unresolvable selector': async () => {
      const selector = transformSelector('unresolvable_selector')
      const element = await spec.findElement(context, selector)
      assert.equal(element, null, `returns null by unresolvable selector - "${selector}"`)
    },

    'find elements with string selector': async () => {
      const selector = transformSelector('html p')
      const elements = await spec.findElements(context, selector)
      const isExpectedElements = await spec.executeScript(
        context,
        `var expected = arguments[0]; return Array.prototype.every.call(document.querySelectorAll("${selector}"), function(element, index) { return element === expected[index] })`,
        elements,
      )
      assert.ok(isExpectedElements, `returns elements by string selector - "${selector}"`)
    },

    'find elements with spec selector': async () => {
      const cssSelector = transformSelector({type: 'css', selector: 'html p'})
      const xpathSelector = transformSelector({type: 'xpath', selector: '//html//p'})
      const verificationScript = `var expected = arguments[0]; return Array.prototype.every.call(document.querySelectorAll('html p'), function(element, index) { return element === expected[index] })`

      const cssElements = await spec.findElements(context, cssSelector)
      const isCssElements = await spec.executeScript(context, verificationScript, cssElements)
      assert.ok(isCssElements, `returns elements by spec selector - ${JSON.stringify(cssSelector)}`)

      const xpathElements = await spec.findElements(context, xpathSelector)
      const isXpathElements = await spec.executeScript(context, verificationScript, xpathElements)
      assert.ok(isXpathElements, `returns element by spec selector - ${JSON.stringify(xpathSelector)}`)
    },

    'find elements with unresolvable selector': async () => {
      const selector = transformSelector('unresolvable_selector')
      const element = await spec.findElements(context, selector)
      assert.deepEqual(element, [], `returns empty array by unresolvable selector - "${selector}"`)
    },

    'child context': async () => {
      const element = await spec.findElement(context, transformSelector('[name="frame1"]'))
      const childContext = await spec.childContext(context, element)
      const inFrame = await spec.executeScript(childContext, 'return window.frameElement.name === "frame1"')
      assert.ok(inFrame, 'returns or switches to a child context')
      assert.ok(
        typeof spec.mainContext === 'function',
        'spec.mainContext also needs to be implemented in order to test spec.childContext',
      )
      await spec.mainContext(context)
    },

    'is equal elements': async () => {
      if (!spec.isEqualElements) return {skipped: true}
      const htmlEl = await spec.findElement(context, transformSelector('html'))
      const htmlEl2 = await spec.executeScript(context, 'return document.documentElement')
      assert.ok(await spec.isEqualElements(context, htmlEl, htmlEl2), 'elements should be equal')
      const bodyEl = await spec.executeScript(context, 'return document.body')
      assert.ok(!(await spec.isEqualElements(context, htmlEl, bodyEl)), 'elements should not be equal')
      assert.ok(
        !(await spec.isEqualElements(context, htmlEl, undefined)),
        'isEqualElements should return false if one of the arguments is falsy',
      )
      assert.ok(
        !(await spec.isEqualElements(context, undefined, htmlEl)),
        'isEqualElements should return false if one of the arguments is falsy',
      )
    },

    'main context': async () => {
      const mainDocument1 = await spec.findElement(context, transformSelector('html'))
      const childContext1 = await spec.childContext(
        context,
        await spec.findElement(context, transformSelector('[name="frame1"]')),
      )
      const childContext2 = await spec.childContext(
        childContext1,
        await spec.findElement(childContext1, transformSelector('[name="frame1-1"]')),
      )
      const frameDocument = await spec.findElement(childContext2, transformSelector('html'))
      assert.ok(!(await isEqualElements(childContext2, mainDocument1, frameDocument)))
      const mainContext = await spec.mainContext(childContext2)
      const mainDocument2 = await spec.findElement(mainContext, transformSelector('html'))
      assert.ok(await isEqualElements(mainContext, mainDocument2, mainDocument1))
    },

    'parent context': async () => {
      const parentContext1 = await spec.childContext(
        context,
        await spec.findElement(context, transformSelector('[name="frame1"]')),
      )
      const parentDocument1 = await spec.findElement(parentContext1, transformSelector('html'))
      const frameContext = await spec.childContext(
        parentContext1,
        await spec.findElement(parentContext1, transformSelector('[name="frame1-1"]')),
      )
      const frameDocument = await spec.findElement(frameContext, transformSelector('html'))
      assert.ok(!(await isEqualElements(frameContext, parentDocument1, frameDocument)))
      const parentContext2 = await spec.parentContext(frameContext)
      const parentDocument2 = await spec.findElement(parentContext2, transformSelector('html'))
      assert.ok(await isEqualElements(parentContext2, parentDocument2, parentDocument1))
      await spec.mainContext(context)
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

    'is driver': async () => {
      assert.ok(await spec.isDriver(driver), 'driver should be considered a driver :)')
      assert.ok(!(await spec.isDriver(undefined)), 'undefined should not be considered a driver')
      assert.ok(!(await spec.isDriver(3)), 'number should not be considered a driver')
      assert.ok(!(await spec.isDriver('str')), 'string should not be considered a driver')
    },
    'is element': async () => {
      const el = await spec.findElement(context, transformSelector('html'))
      assert.ok(await spec.isElement(el), 'element should be considered an element :)')
      assert.ok(!(await spec.isElement(undefined)), 'undefined should not be considered an element')
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

  function isEqualElements(context: TContext, element1: TElement, element2: TElement): Promise<boolean> {
    return (
      spec.isEqualElements?.(context, element1, element2) ??
      spec.executeScript(context, snippets.isEqualElements, [element1, element2]).catch(() => false)
    )
  }

  function extractContext(driver: TDriver): TContext {
    return spec.extractContext?.(driver) ?? (driver as unknown as TContext)
  }

  function transformSelector(selector: any): TSelector {
    return spec.transformSelector?.(selector) ?? selector
  }
}
