import browser from 'webextension-polyfill'
import * as utils from '@applitools/utils'

// #region UTILITY

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
  return utils.types.has(selector, ['type', 'selector'])
}
export function transformSelector(selector) {
  if (utils.types.isString(selector)) {
    return {type: 'css', selector: selector}
  } else if (utils.types.has(selector, 'selector')) {
    if (!utils.types.isString(selector.selector)) return selector.selector
    if (!utils.types.has(selector, 'type')) return {type: 'css', selector: selector.selector}
  }
  return selector
}
export function extractContext(driver) {
  return {...driver, frameId: 0}
}
export function isStaleElementError(error) {
  if (!error) return false
  error = error.originalError || error
  return error instanceof Error && error.message === 'StaleElementReferenceError'
}

// #endregion

// #region COMMANDS

export async function executeScript(context, script, arg) {
  const [{result, error}] = await browser.scripting.executeScript({
    target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
    func: script,
    args: [arg || null],
  })

  if (error) {
    const err = new Error(error.message)
    err.stack = error.stack
    throw err
  }
  return result
}
export async function mainContext(context) {
  return {...context, frameId: 0}
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
    await browser.scripting.executeScript({
      target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
      func: (element, key) => {
        refer.deref(element).contentWindow.postMessage({key, isApplitools: true}, '*')
      },
      args: [element, key],
    })
    setTimeout(() => reject(new Error('No such frame')), 5000)
  })

  return {...context, frameId: childFrameId}
}
export async function findElement(context, selector, parent) {
  const [{result}] = await browser.scripting.executeScript({
    target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
    func: (selector, parent) => {
      if (selector.type === 'css') {
        const root = parent ? refer.deref(parent) : document
        return refer.ref(root.querySelector(selector.selector))
      } else if (selector.type === 'xpath') {
        return refer.ref(
          document.evaluate(selector.selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue,
        )
      }
    },
    args: [selector, parent || null],
  })
  return result
}
export async function findElements(context, selector, parent) {
  const [{result}] = await browser.scripting.executeScript({
    target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
    func: (selector, parent) => {
      if (selector.type === 'css') {
        const root = parent ? refer.deref(parent) : document
        return Array.from(root.querySelectorAll(selector.selector), refer.ref)
      } else if (selector.type === 'xpath') {
        const iterator = document.evaluate(selector.selector, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE)
        const elements = []
        for (let element = iterator.iterateNext(); element !== null; element = iterator.iterateNext()) {
          elements.push(refer.ref(element))
        }
        return elements
      }
    },
    args: [selector, parent || null],
  })
  return result
}
export async function getWindowSize(driver) {
  const [{result}] = await browser.scripting.executeScript({
    target: {tabId: driver.tabId, frameIds: [0]},
    func: () => ({width: window.outerWidth, height: window.outerHeight}),
  })
  return result
}
export async function setWindowSize(driver, size) {
  await browser.windows.update(driver.windowId, {
    state: 'normal',
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
  })
}
export async function getCookies(_driver) {
  const cookies = await browser.cookies.getAll({})
  return cookies.map(cookie => {
    const copy = {
      ...cookie,
      expiry: cookie.expirationDate,
      sameSite:
        cookie.sameSite === 'no_restriction'
          ? 'None'
          : `${cookie.sameSite[0].toUpperCase()}${cookie.sameSite.slice(1)}`,
    }
    delete copy.expirationDate
    delete copy.hostOnly
    delete copy.session
    delete copy.storeId
    return copy
  })
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

export async function getDriverInfo() {
  return {features: {canExecuteOnlyFunctionScripts: true}}
}
// #endregion
