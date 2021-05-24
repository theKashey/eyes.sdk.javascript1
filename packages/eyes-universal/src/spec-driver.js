const utils = require('@applitools/utils')

function makeSpecDriver(ws, commands) {
  const spec = {
    // #region UTILITY
    isDriver(driver) {
      return utils.types.has(driver, 'applitools-ref-id')
    },
    isElement(element) {
      return utils.types.has(element, 'applitools-ref-id')
    },
    isSelector(selector) {
      return (
        utils.types.isString(selector, 'applitools-ref-id') ||
        utils.types.has(selector, ['type', 'selector'])
      )
    },
    extractSelector(element) {
      return element.selector
    },
    isStaleElementError(error) {
      return error.isStaleElementError
    },
    // #endregion

    // #region COMMANDS
    async isEqualElements(context, element1, element2) {
      return ws.request('Driver.isEqualElements', [context, element1, element2])
    },
    async executeScript(context, script, ...args) {
      return ws.request('Driver.executeScript', [context, script.toString(), ...args])
    },
    async mainContext(context) {
      return ws.request('Driver.mainContext', [context])
    },
    async parentContext(context) {
      return ws.request('Driver.parentContext', [context])
    },
    async childContext(context, element) {
      return ws.request('Driver.childContext', [context, element])
    },
    async findElement(context, selector) {
      return ws.request('Driver.findElement', [context, selector])
    },
    async findElements(context, selector) {
      return ws.request('Driver.findElements', [context, selector])
    },
    async getWindowRect(driver) {
      return ws.request('Driver.getWindowRect', [driver])
    },
    async setWindowRect(driver, rect) {
      return ws.request('Driver.setWindowRect', [driver, rect])
    },
    async getViewportSize(driver) {
      return ws.request('Driver.getViewportSize', [driver])
    },
    async setViewportSize(driver, size) {
      return ws.request('Driver.setViewportSize', [driver, size])
    },
    async getOrientation(driver) {
      return ws.request('Driver.getOrientation', [driver])
    },
    async getTitle(driver) {
      return ws.request('Driver.getTitle', [driver])
    },
    async getUrl(driver) {
      return ws.request('Driver.getUrl', [driver])
    },
    async getDriverInfo(driver) {
      return ws.request('Driver.getDriverInfo', [driver])
    },
    async takeScreenshot(driver) {
      const buffer = await ws.request('Driver.takeScreenshot', [driver])
      return Buffer.from(buffer.data)
    },
    // #endregion
  }

  return commands.reduce((commands, name) => {
    return Object.assign(commands, {[name]: spec[name]})
  }, {})
}

module.exports = makeSpecDriver
