import assert from 'assert'
import {makeLogger} from '@applitools/logger'
import {Driver, Context} from '../../src/index'
import {MockDriver, spec} from '../../src/fake/index'

const logger = makeLogger()

describe('context', () => {
  let mock: MockDriver,
    driver: Driver<spec.Driver, spec.Driver, spec.Element, spec.Selector>,
    context: Context<spec.Driver, spec.Driver, spec.Element, spec.Selector>

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
                children: [{selector: 'frame1-1--element1', name: 'element within frame'}],
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
                children: [{selector: 'shadow1-1--element1', name: 'element within shadow'}],
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
    await childContext11.focus()
    const element = await childContext11.element('frame1-1--element1')

    assert.strictEqual(element.target.name, 'element within frame')
  })

  it('element(shadow-selector)', async () => {
    const element = await context.element({
      selector: 'shadow1',
      shadow: {selector: 'shadow1-1', shadow: {selector: 'shadow1-1--element1'}},
    })
    assert.deepStrictEqual(element.target.name, 'element within shadow')
  })

  it('element(frame-selector)', async () => {
    const element = await context.element({
      selector: 'frame1',
      frame: {selector: 'frame1-1', frame: {selector: 'frame1-1--element1'}},
    })
    assert.deepStrictEqual(element.target.name, 'element within frame')
  })

  it('element(non-existent)', async () => {
    const element = await context.element('non-existent')

    assert.strictEqual(element, null)
  })

  it('element(non-existent-shadow)', async () => {
    const element = await context.element({
      selector: 'shadow1',
      shadow: {selector: 'shadow1-non-existent', shadow: {selector: 'shadow1-non-existent--element1'}},
    })

    assert.strictEqual(element, null)
  })

  it('element(non-existent-frame)', async () => {
    const element = await context.element({
      selector: 'frame1',
      frame: {selector: 'frame1-non-existent', frame: {selector: 'frame1-non-existent--element1'}},
    })

    assert.strictEqual(element, null)
  })

  it('elements(selector)', async () => {
    const childContext1 = await context.context('frame1')
    const childContext11 = await childContext1.context('frame1-1')
    await childContext11.focus()
    const elements = await childContext11.elements('frame1-1--element1')

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 1)
    assert.strictEqual(elements[0].target.name, 'element within frame')
  })

  it('elements(shadow-selector)', async () => {
    const elements = await context.elements({
      selector: 'shadow1',
      shadow: {selector: 'shadow1-1', shadow: {selector: 'shadow1-1--element1'}},
    })

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 1)
    assert.strictEqual(elements[0].target.name, 'element within shadow')
  })

  it('elements(shadow-selector)', async () => {
    const elements = await context.elements({
      selector: 'frame1',
      frame: {selector: 'frame1-1', frame: {selector: 'frame1-1--element1'}},
    })

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 1)
    assert.strictEqual(elements[0].target.name, 'element within frame')
  })

  it('elements(non-existent)', async () => {
    const elements = await context.elements('non-existent')

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 0)
  })

  it('elements(non-existent-shadow)', async () => {
    const elements = await context.elements({
      selector: 'shadow1',
      shadow: {selector: 'shadow1-non-existent', shadow: {selector: 'shadow1-non-existent--element1'}},
    })

    assert.ok(Array.isArray(elements))
    assert.strictEqual(elements.length, 0)
  })

  it('elements(non-existent-frame)', async () => {
    const elements = await context.elements({
      selector: 'frame1',
      frame: {selector: 'frame1-non-existent', frame: {selector: 'frame1-non-existent--element1'}},
    })

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

  describe('selecotrOrElement', () => {
    const selector = 'frame10'
    const randomLengthOfElements = Array.from({length: parseInt(Math.random() * 8 + '') + 2}, () => ({
      selector,
      frame: true,
    }))

    beforeEach(async () => {
      mock = new MockDriver()
      mock.mockElements(randomLengthOfElements)
      driver = new Driver({
        logger,
        spec,
        driver: mock,
      })
      await driver.init()
    })

    afterEach(async () => {
      await driver.switchToMainContext()
    })

    it('should return single element if the `isElement` return `true` and `isSelector` return `false`', async () => {
      const selectorOrElement = {id: selector}
      assert.strictEqual(spec.isElement(selectorOrElement), true, `the selectorOrElement isn't a element`)
      assert.strictEqual(spec.isSelector(selectorOrElement), false, `the selectorOrElement isn't a selector`)
      const frameElement = await driver.mainContext.elements(selectorOrElement)
      assert.strictEqual(frameElement.length, 1, `the length of frameElement should be 1`)
    })
    it('should return all of the elements if the `isElement` return `false` and `isSelector` return `true`', async () => {
      const selectorOrElement = selector
      assert.strictEqual(spec.isElement(selectorOrElement), false, `the selectorOrElement isn't a element`)
      assert.strictEqual(spec.isSelector(selectorOrElement), true, `the selectorOrElement isn't a selector`)
      const frameElement = await driver.mainContext.elements(selectorOrElement)
      assert.strictEqual(
        frameElement.length,
        randomLengthOfElements.length,
        `the length of frameElement isn't equal to the length of randomLengthOfElements`,
      )
    })
    it('should return all of the elements if the `isElement` and `isSelector` both return `true`', async () => {
      const selectorOrElement = {id: selector, forceSelector: true}
      assert.strictEqual(spec.isElement(selectorOrElement), true, `the selectorOrElement isn't a element`)
      assert.strictEqual(spec.isSelector(selectorOrElement), true, `the selectorOrElement isn't a selector`)
      const frameElement = await driver.mainContext.elements(selectorOrElement)
      assert.strictEqual(
        frameElement.length,
        randomLengthOfElements.length,
        `the length of frameElement isn't equal to the length of randomLengthOfElements`,
      )
    })
    it('should throw an error if both `isElement` and `isSelector` return `false`', async () => {
      const selectorOrElement = {id: selector, notting: true}
      assert.strictEqual(spec.isElement(selectorOrElement), false, `the selectorOrElement isn't a element`)
      assert.strictEqual(spec.isSelector(selectorOrElement), false, `the selectorOrElement isn't a selector`)
      try {
        await driver.mainContext.elements(selectorOrElement)
        assert.strictEqual(true, false, 'should thrown error and skip this')
      } catch {
        assert.strictEqual(true, true, 'should thrown error and get here')
      }
    })
  })
})
