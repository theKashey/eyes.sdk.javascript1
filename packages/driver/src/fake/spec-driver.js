const utils = require('@applitools/utils')

const spec = {
  isDriver(driver) {
    return driver && driver.constructor.name === 'MockDriver'
  },
  isElement(element) {
    return utils.types.has(element, 'id')
  },
  isSelector(selector) {
    return utils.types.isString(selector) || utils.types.has(selector, ['using', 'value'])
  },
  transformSelector(selector) {
    return selector.selector || selector
  },
  isStaleElementError() {
    return false
  },
  isEqualElements(_driver, element1, element2) {
    return element1.id === element2.id
  },
  executeScript(driver, script, ...args) {
    return driver.executeScript(script, args)
  },
  findElement(driver, selector, parent) {
    return driver.findElement(selector.selector || selector, parent)
  },
  findElements(driver, selector, parent) {
    return driver.findElements(selector.selector || selector, parent)
  },
  mainContext(driver) {
    return driver.switchToFrame(null)
  },
  parentContext(driver) {
    return driver.switchToParentFrame()
  },
  childContext(driver, reference) {
    return driver.switchToFrame(reference)
  },
  takeScreenshot(driver) {
    return driver.takeScreenshot()
  },
  getDriverInfo(driver) {
    return driver.info
  },
  async getWindowSize(driver) {
    const rect = await driver.getWindowRect()
    return rect
  },
  async setWindowSize(driver, size) {
    await driver.setWindowRect(size)
  },
  async getUrl(driver) {
    if (this._isNative) return null
    return driver.getUrl()
  },
  async getTitle(driver) {
    if (this._isNative) return null
    return driver.getTitle()
  },
  async visit(driver, url) {
    await driver.visit(url)
  },
}

module.exports = {spec}
