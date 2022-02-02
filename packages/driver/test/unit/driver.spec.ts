import assert from 'assert'
import {MockDriver, spec} from '../../src/fake/index'
import {Driver} from '../../src/index'

const logger = {log: () => null as any, warn: () => null as any, error: () => null as any}

describe('driver', () => {
  let mock: spec.Driver, driver: Driver<spec.Driver, spec.Driver, spec.Element, spec.Selector>

  before(async () => {
    mock = new MockDriver()
    mock.mockElements([
      {selector: 'frame0', frame: true},
      {
        selector: 'frame1',
        frame: true,
        isCORS: true,
        children: [
          {selector: 'frame1-0', frame: true, isCORS: true},
          {selector: 'frame1-1', frame: true},
          {selector: 'frame1-2', frame: true, isCORS: true},
        ],
      },
      {
        selector: 'frame2',
        frame: true,
        isCORS: true,
        children: [
          {selector: 'frame2-0', frame: true, isCORS: true},
          {
            selector: 'frame2-1',
            frame: true,
            isCORS: true,
            children: [
              {selector: 'frame2-1-0', frame: true, isCORS: true},
              {selector: 'frame2-1-1', frame: true},
              {selector: 'frame2-1-2', frame: true, isCORS: true},
            ],
          },
          {selector: 'frame2-2', frame: true},
        ],
      },
    ])
    driver = new Driver({logger, spec, driver: mock})
    await driver.init()
  })

  afterEach(async () => {
    await driver.switchToMainContext()
  })

  it('getTitle()', async () => {
    assert.strictEqual(await driver.getTitle(), 'Default Page Title')
  })

  it('getUrl()', async () => {
    assert.strictEqual(await driver.getUrl(), 'http://default.url')
  })

  it('switchToChildContext(element)', async () => {
    const frameElement = await mock.findElement('frame0')
    await driver.switchToChildContext(frameElement)
    assert.strictEqual(driver.currentContext.path.length, 2)
    assert.ok(await driver.currentContext.equals(frameElement))
  })

  it('switchToChildContext(eyes-element)', async () => {
    const frameElement = await driver.element('frame0')
    await driver.switchToChildContext(frameElement)
    assert.strictEqual(driver.currentContext.path.length, 2)
    assert.ok(await driver.currentContext.equals(frameElement))
  })

  it('switchToMainContext()', async () => {
    const mainContextDocument = await driver.element('html')
    await driver.switchToChildContext('frame0')
    await driver.switchToMainContext()
    assert.strictEqual(driver.currentContext, driver.mainContext)
    const currentContextDocument = await driver.element('html')
    assert.ok(await mainContextDocument.equals(currentContextDocument))
  })

  it('switchToParentContext()', async () => {
    const mainContextDocument = await driver.element('html')
    await driver.switchToChildContext('frame1')
    const nestedContextDocument = await driver.element('html')
    await driver.switchToChildContext('frame1-1')
    assert.strictEqual(driver.currentContext.path.length, 3)

    await driver.switchToParentContext()
    assert.strictEqual(driver.currentContext.path.length, 2)
    const parentContextDocument = await driver.element('html')
    assert.ok(await parentContextDocument.equals(nestedContextDocument))

    await driver.switchToParentContext()
    assert.strictEqual(driver.currentContext, driver.mainContext)
    const grandparentContextDocument = await driver.element('html')
    assert.ok(await grandparentContextDocument.equals(mainContextDocument))
  })

  it('switchTo(context)', async () => {
    const contextDocuments = []
    contextDocuments.unshift(await driver.element('html'))
    for (const frameSelector of ['frame2', 'frame2-1', 'frame2-1-0']) {
      await driver.switchToChildContext(frameSelector)
      contextDocuments.unshift(await driver.element('html'))
    }
    assert.strictEqual(driver.currentContext.path.length, 4)
    const requiredContext = driver.currentContext

    await driver.switchToMainContext()
    assert.strictEqual(driver.currentContext, driver.mainContext)

    await driver.switchTo(requiredContext)
    assert.strictEqual(driver.currentContext, driver.currentContext)

    for (const contextDocument of contextDocuments) {
      const currentDocument = await driver.element('html')
      assert.ok(await currentDocument.equals(contextDocument))
      await driver.switchToParentContext()
    }
  })

  describe('refreshContexts()', () => {
    afterEach(async () => {
      await driver.switchToMainContext()
    })

    it('untracked same origin frame chain [(0-0)?]', () => {
      return untrackedFrameChainSameOrigin()
    })

    it('untracked cors frame chain [(0-1-2)?]', () => {
      return untrackedCorsFrameChain()
    })

    it('untracked mixed frame chain [(0-1-0)?]', () => {
      return untrackedMixedFrameChain1()
    })

    it('untracked mixed frame chain [(0-1-1)?]', () => {
      return untrackedMixedFrameChain2()
    })

    it('partially tracked frame chain [0-2-1-(2)?]', () => {
      return partiallyTrackedFrameChain1()
    })

    it('partially tracked frame chain [(0-2)?-1-2]', () => {
      return partiallyTrackedFrameChain2()
    })

    it('tracked frame chain [0-2-1-2]', () => {
      return trackedFrameChain()
    })
  })

  describe('refreshContexts() when parentContext not implemented', () => {
    before(() => {
      // unable to deep clone driver object atm
      // @ts-ignore
      delete driver._spec.parentContext
    })

    afterEach(async () => {
      await driver.switchToMainContext()
    })

    it('untracked same origin frame chain [(0-0)?]', () => {
      return untrackedFrameChainSameOrigin()
    })

    it('untracked cors frame chain [(0-1-2)?]', () => {
      return untrackedCorsFrameChain()
    })

    it('untracked mixed frame chain [(0-1-0)?]', () => {
      return untrackedMixedFrameChain1()
    })

    it('untracked mixed frame chain [(0-1-1)?]', () => {
      return untrackedMixedFrameChain2()
    })

    it('partially tracked frame chain [0-2-1-(2)?]', () => {
      return partiallyTrackedFrameChain1()
    })

    it('partially tracked frame chain [(0-2)?-1-2]', () => {
      return partiallyTrackedFrameChain2()
    })

    it('tracked frame chain [0-2-1-2]', () => {
      return trackedFrameChain()
    })
  })

  async function untrackedFrameChainSameOrigin() {
    const frameElements = [null] as any[]
    const frameElement = await mock.findElement('frame0')
    frameElements.push(frameElement)
    await mock.switchToFrame(frameElement)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function untrackedCorsFrameChain() {
    const frameElements = [null] as any[]
    const frameElement1 = await mock.findElement('frame1')
    frameElements.push(frameElement1)
    await mock.switchToFrame(frameElement1)
    const frameElement2 = await mock.findElement('frame1-2')
    frameElements.push(frameElement2)
    await mock.switchToFrame(frameElement2)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function untrackedMixedFrameChain1() {
    const frameElements = [null] as any[]
    const frameElement1 = await mock.findElement('frame1')
    frameElements.push(frameElement1)
    await mock.switchToFrame(frameElement1)
    const frameElement0 = await mock.findElement('frame1-0')
    frameElements.push(frameElement0)
    await mock.switchToFrame(frameElement0)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function untrackedMixedFrameChain2() {
    const frameElements = [null] as any[]
    const frameElement1 = await mock.findElement('frame1')
    frameElements.push(frameElement1)
    await mock.switchToFrame(frameElement1)
    const frameElement11 = await mock.findElement('frame1-1')
    frameElements.push(frameElement11)
    await mock.switchToFrame(frameElement11)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function partiallyTrackedFrameChain1() {
    const frameElements = [null] as any[]
    const frameElement2 = await mock.findElement('frame2')
    frameElements.push(frameElement2)
    await driver.switchToChildContext(frameElement2)
    const frameElement1 = await mock.findElement('frame2-1')
    frameElements.push(frameElement1)
    await driver.switchToChildContext(frameElement1)
    const frameElement22 = await mock.findElement('frame2-1-2')
    frameElements.push(frameElement22)
    await mock.switchToFrame(frameElement22)
    assert.strictEqual(driver.currentContext.path.length, 3)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function partiallyTrackedFrameChain2() {
    const frameElements = [null] as any[]
    const frameElement2 = await mock.findElement('frame2')
    frameElements.push(frameElement2)
    await mock.switchToFrame(frameElement2)
    const frameElement1 = await mock.findElement('frame2-1')
    frameElements.push(frameElement1)
    await driver.switchToChildContext(frameElement1)
    const frameElement22 = await mock.findElement('frame2-1-2')
    frameElements.push(frameElement22)
    await driver.switchToChildContext(frameElement22)
    assert.strictEqual(driver.currentContext.path.length, 3)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function trackedFrameChain() {
    const frameElements = [null] as any[]
    const frameElement2 = await mock.findElement('frame2')
    frameElements.push(frameElement2)
    await driver.switchToChildContext(frameElement2)
    const frameElement1 = await mock.findElement('frame2-1')
    frameElements.push(frameElement1)
    await driver.switchToChildContext(frameElement1)
    const frameElement22 = await mock.findElement('frame2-1-2')
    frameElements.push(frameElement22)
    await driver.switchToChildContext(frameElement22)
    assert.strictEqual(driver.currentContext.path.length, frameElements.length)
    await driver.refreshContexts()
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }
})

describe('driver native', () => {
  let driver: Driver<any, any, any, any>

  before(async () => {
    driver = new Driver({logger, spec, driver: new MockDriver({device: {isNative: true}})})
    await driver.init()
  })

  it('skip unnecessary method calls on native mode', async () => {
    const title = await driver.getTitle()
    const url = await driver.getUrl()
    assert.strictEqual(title, null)
    assert.strictEqual(url, null)
  })

  describe('from driver info', () => {
    let driver: Driver<any, any, any, any>

    before(async () => {
      driver = new Driver({
        logger,
        spec,
        driver: new MockDriver({
          device: {isNative: true, name: 'MobilePhone'},
          platform: {name: 'OS', version: 'V'},
        }),
      })
      await driver.init()
    })

    it('returns device name', () => {
      assert.strictEqual(driver.deviceName, 'MobilePhone')
    })

    it('returns platform name', () => {
      assert.strictEqual(driver.platformName, 'OS')
    })

    it('returns platform version', () => {
      assert.strictEqual(driver.platformVersion, 'V')
    })

    it('returns browser name', () => {
      assert.strictEqual(driver.browserName, null)
    })

    it('returns browser version', () => {
      assert.strictEqual(driver.browserVersion, null)
    })
  })

  describe('from no info', () => {
    before(async () => {
      driver = new Driver({
        logger,
        spec,
        driver: new MockDriver({device: {isNative: true}}),
      })
      await driver.init()
    })

    it('returns device name', () => {
      assert.strictEqual(driver.deviceName, undefined)
    })

    it('returns platform name', () => {
      assert.strictEqual(driver.platformName, null)
    })

    it('returns platform version', () => {
      assert.strictEqual(driver.platformVersion, null)
    })

    it('returns browser name', () => {
      assert.strictEqual(driver.browserName, null)
    })

    it('returns browser version', () => {
      assert.strictEqual(driver.browserVersion, null)
    })
  })
})

describe('driver mobile', () => {
  it('from driver info', async () => {
    const driver: Driver<any, any, any, any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: null,
        device: {isMobile: true, name: 'MobilePhone'},
        platform: {name: 'OS', version: 'V'},
        browser: {name: 'Browser', version: '3'},
      }),
    }).init()

    const driverInfo = {
      deviceName: driver.deviceName,
      platformName: driver.platformName,
      platformVersion: driver.platformVersion,
      browserName: driver.browserName,
      browserVersion: driver.browserVersion,
    }

    assert.deepStrictEqual(driverInfo, {
      deviceName: 'MobilePhone',
      platformName: 'OS',
      platformVersion: 'V',
      browserName: 'Browser',
      browserVersion: '3',
    })
  })

  it('from ua info', async () => {
    const driver: Driver<any, any, any, any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
      }),
    }).init()

    const driverInfo = {
      deviceName: driver.deviceName,
      platformName: driver.platformName,
      platformVersion: driver.platformVersion,
      browserName: driver.browserName,
      browserVersion: driver.browserVersion,
    }

    assert.deepStrictEqual(driverInfo, {
      deviceName: null,
      platformName: 'iOS',
      platformVersion: '12',
      browserName: 'Safari',
      browserVersion: '12',
    })
  })

  it('from driver info and ua info', async () => {
    const driver: Driver<any, any, any, any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        device: {isMobile: true, name: 'MobilePhone'},
        platform: {name: 'CorrectOS', version: 'X'},
        browser: {name: 'WrongBrowser', version: '0'},
      }),
    }).init()

    const driverInfo = {
      deviceName: driver.deviceName,
      platformName: driver.platformName,
      platformVersion: driver.platformVersion,
      browserName: driver.browserName,
      browserVersion: driver.browserVersion,
    }

    assert.deepStrictEqual(driverInfo, {
      deviceName: 'MobilePhone',
      platformName: 'CorrectOS',
      platformVersion: 'X',
      browserName: 'Safari',
      browserVersion: '12',
    })
  })
})
