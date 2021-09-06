import assert from 'assert'
import {Driver, Context} from '../../src/index'

const MockDriver = require('../fixtures/mock-driver')
const spec = require('../fixtures/spec-driver')

describe('context', () => {
  let mock: any, driver: Driver<any, any, any, any>, context: Context<any, any, any, any>
  const logger = {log: () => null as any, warn: () => null as any, error: () => null as any}

  beforeEach(() => {
    mock = new MockDriver()
    mock.mockElements([
      {
        selector: 'element-scroll',
        scrollPosition: {x: 21, y: 22},
        children: [
          {
            selector: 'frame1',
            frame: true,
            children: [
              {
                selector: 'frame1-1',
                frame: true,
                rect: {x: 1, y: 2, width: 101, height: 102},
                children: [{selector: 'frame1-1--element1'}],
              },
            ],
          },
          {
            selector: 'frame2',
            frame: true,
            children: [{selector: 'frame2--element1'}],
          },
          {
            selector: 'shadow1',
            shadow: true,
            children: [
              {selector: 'shadow1--element1'},
              {
                selector: 'shadow1-1',
                shadow: true,
                children: [{selector: 'shadow1-1--element1'}],
              },
            ],
          },
        ],
      },
    ])
    driver = new Driver({logger, spec, driver: mock})
    context = driver.currentContext
  })

  it('constructor(logger, context, {driver})', async () => {
    assert.ok(context.isMain)
    assert.ok(context.target)
  })

  it('context(element)', async () => {
    const element = await mock.findElement('frame1')
    const childContext = await context.context(element)

    assert.strictEqual(childContext.parent, context)
    assert.strictEqual(childContext.main, context)
  })

  it('init()', async () => {
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    await childContext11.init()

    assert.strictEqual((await childContext1.getContextElement()).target.selector, 'frame1')
    assert.strictEqual((await childContext11.getContextElement()).target.selector, 'frame1-1')
    assert.strictEqual(driver.currentContext, childContext1)
  })

  it('focus()', async () => {
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    await childContext11.focus()

    assert.strictEqual(driver.currentContext, childContext11)
  })

  it('element(selector)', async () => {
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    const element = await childContext11.element('frame1-1--element1')

    assert.strictEqual(element.selector, 'frame1-1--element1')
  })

  it('element(shadow-selector)', async () => {
    const selector = {
      selector: 'shadow1',
      shadow: {selector: 'shadow1-1', shadow: {selector: 'shadow1-1--element1'}},
    }
    const element = await context.element(selector)
    assert.deepStrictEqual(element.selector, selector)
  })

  it('elements(non-existent)', async () => {
    const selector = 'non-existent'
    const element = await context.element(selector)

    assert.strictEqual(element, null)
  })

  it('elements(non-existent-shadow)', async () => {
    const selector = {
      selector: 'shadow1',
      shadow: {selector: 'shadow1-non-existent', shadow: {selector: 'shadow1-non-existent--element1'}},
    }
    const element = await context.element(selector)

    assert.strictEqual(element, null)
  })

  it('elements(selector)', async () => {
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    const selector = 'frame1-1--element1'
    const elements = await childContext11.elements(selector)

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 1)
    assert.strictEqual(elements[0].selector, selector)
  })

  it('elements(shadow-selector)', async () => {
    const selector = {
      selector: 'shadow1',
      shadow: {selector: 'shadow1-1', shadow: {selector: 'shadow1-1--element1'}},
    }
    const elements = await context.elements(selector)

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 1)
    assert.deepStrictEqual(elements[0].selector, selector)
  })

  it('elements(non-existent)', async () => {
    const selector = 'non-existent'
    const elements = await context.elements(selector)

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 0)
  })

  it('elements(non-existent-shadow)', async () => {
    const selector = {
      selector: 'shadow1',
      shadow: {selector: 'shadow1-non-existent', shadow: {selector: 'shadow1-non-existent--element1'}},
    }
    const elements = await context.elements(selector)

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 0)
  })

  it('getContextElement()', async () => {
    const mainContext = context
    const childContext = await context.context('frame1')

    assert.strictEqual(await mainContext.getContextElement(), null)
    assert.strictEqual((await childContext.getContextElement()).target.selector, 'frame1')
  })

  it('getScrollingElement()', async () => {
    const mainContext = context
    await mainContext.setScrollingElement(await mock.findElement('element-scroll'))
    const childContext = await context.context('frame1')

    assert.strictEqual((await mainContext.getScrollingElement()).target.selector, 'element-scroll')
    assert.strictEqual((await childContext.getScrollingElement()).target.selector, 'html')
  })

  it('getClientRect()', async () => {
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    await childContext11.init()

    const rectContext11 = await childContext11.getClientRegion()
    assert.deepStrictEqual(rectContext11, {
      x: 1,
      y: 2,
      width: 101,
      height: 102,
    })
    assert.strictEqual(driver.currentContext, childContext11.parent)

    const rectContext1 = await childContext1.getClientRegion()
    assert.deepStrictEqual(rectContext1, {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    })
    assert.strictEqual(driver.currentContext, childContext11.parent)
  })

  it('getLocationInViewport()', async () => {
    await context.setScrollingElement('element-scroll')
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    await childContext11.focus()

    const locationContext11 = await childContext11.getLocationInViewport()
    assert.deepStrictEqual(locationContext11, {x: -20, y: -20})
  })
})
