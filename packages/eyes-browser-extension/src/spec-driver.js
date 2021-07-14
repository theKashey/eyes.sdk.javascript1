import browser from 'webextension-polyfill'
import * as utils from '@applitools/utils'

export function isDriver(driver) {
  return utils.types.has(driver, ['windowId', 'tabId'])
}

export function isContext(context) {
  return utils.types.has(context, ['windowId', 'tabId', 'frameId'])
}

export function isElement(element) {
  return utils.types.has(element, 'applitools-ref-id')
}

export function isSelector(selector) {
  return utils.types.isString(selector) || utils.types.has(selector, ['type', 'selector'])
}

export function isStaleElementError(error) {
  if (!error) return false
  error = error.originalError || error
  return error instanceof Error && error.message === 'StaleElementReferenceError'
}

export async function mainContext(context) {
  const frames = await browser.webNavigation.getAllFrames({tabId: context.tabId})
  const mainFrame = frames.find(frame => frame.parentFrameId === -1)
  return {...context, frameId: mainFrame.frameId}
}

export async function parentContext(context) {
  const frames = await browser.webNavigation.getAllFrames({tabId: context.tabId})
  const frame = frames.find(frame => frame.frameId === context.frameId)
  return {...context, frameId: frame.parentFrameId}
}

export async function childContext(context, element) {
  const childFrameId = await new Promise(async (resolve, reject) => {
    const key = utils.general.guid()
    browser.runtime.onMessage.addListener(handler)
    function handler(data, sender) {
      if (data.key === key) {
        resolve(sender.frameId)
        browser.runtime.onMessage.removeListener(handler)
      }
    }
    await browser.tabs.executeScript(context.tabId, {
      code: `refer.deref(${JSON.stringify(
        element,
      )}).contentWindow.dispatchEvent(new CustomEvent('applitools-frame-message', {detail: {key: '${key}'}}))`,
      frameId: context.frameId,
    })
    setTimeout(() => reject(new Error('No such frame')), 5000)
  })

  return {...context, frameId: childFrameId}
}

export async function executeScript(context, script, arg) {
  script = utils.types.isFunction(script) ? `return (${script}).apply(null, arguments)` : script
  const [response] = await browser.tabs.executeScript(context.tabId, {
    frameId: context.frameId,
    code: `JSON.stringify((function() {
      try {
        const fn = new Function(${JSON.stringify(script)});
        const result = fn(refer.deref(${JSON.stringify(arg)}));
        return {result: refer.ref(result)};
      } catch (error) {
        return {error: error instanceof Error ? {message: error.message, stack: error.stack} : error}
      }
    })())`,
  })
  const {result, error} = JSON.parse(response)

  if (error) {
    if (utils.types.has(error, ['message', 'stack'])) {
      const err = new Error(error.message)
      err.stack = error.stack
      throw err
    }
    throw error
  } else return result
}

export async function findElement(context, selector) {
  selector = utils.types.isString(selector) ? {type: 'css', selector} : selector
  if (selector.type === 'css') {
    const [element] = await browser.tabs.executeScript(context.tabId, {
      frameId: context.frameId,
      code: `JSON.stringify(refer.ref(document.querySelector('${selector.selector}')))`,
    })
    return JSON.parse(element)
  } else if (selector.type === 'xpath') {
    const [element] = await browser.tabs.executeScript(context.tabId, {
      frameId: context.frameId,
      code: `JSON.stringify(refer.ref(document.evaluate('${selector.selector}', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue))`,
    })
    return JSON.parse(element)
  }
}

export async function findElements(context, selector) {
  selector = utils.types.isString(selector) ? {type: 'css', selector} : selector
  if (selector.type === 'css') {
    const [elements] = await browser.tabs.executeScript(context.tabId, {
      frameId: context.frameId,
      code: `JSON.stringify(Array.from(document.querySelectorAll('${selector.selector}'), refer.ref))`,
    })
    return JSON.parse(elements)
  } else if (selector.type === 'xpath') {
    const [elements] = await browser.tabs.executeScript(context.tabId, {
      frameId: context.frameId,
      code: `JSON.stringify((function() {
        const iterator = document.evaluate('${selector.selector}', document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        const elements = [];
        for (let element = iterator.iterateNext(); element !== null; element = iterator.iterateNext()) {
          elements.push(refer.ref(element));
        }
        return elements;
      })())`,
    })
    return JSON.parse(elements)
  }
}

export async function takeScreenshot(driver) {
  const [activeTab] = await browser.tabs.query({windowId: driver.windowId, active: true})
  await browser.tabs.update(driver.tabId, {active: true})
  const url = await browser.tabs.captureVisibleTab(driver.windowId, {format: 'png'})
  await browser.tabs.update(activeTab.id, {active: true})
  await utils.general.sleep(500)
  return url.replace(/^data:image\/png;base64,/, '')
}

export async function getTitle(driver) {
  const {title} = await browser.tabs.get(driver.tabId)
  return title
}

export async function getUrl(driver) {
  const {url} = await browser.tabs.get(driver.tabId)
  return url
}

export async function getWindowSize(driver) {
  const [size] = await browser.tabs.executeScript(driver.tabId, {
    code: 'JSON.stringify({width: window.outerWidth, height: window.outerHeight})',
  })
  return JSON.parse(size)
}

export async function setWindowSize(driver, size) {
  await browser.windows.update(driver.windowId, {
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
  })
}
