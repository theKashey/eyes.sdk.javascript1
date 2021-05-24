const assert = require('assert')
const utils = require('@applitools/utils')

function makeSDK(settings = {}) {
  settings = Object.assign({viewportSize: {width: 1000, height: 2000}}, settings)
  const history = []
  return {
    isDriver,
    isElement,
    isSelector,
    makeManager,
    getViewportSize,
    setViewportSize,
    // closeBatch,
    // deleteTest,
    settings,
    history,
  }

  function isDriver(driver) {
    return Boolean(driver.isDriver)
  }

  function isElement(element) {
    return Boolean(element.isElement)
  }

  function isSelector(selector) {
    return utils.types.isString(selector) || utils.types.has(selector, ['type', 'selector'])
  }

  function makeManager(config) {
    const test = {
      steps: [],
    }

    history.push({command: 'makeManager', data: config})

    return {makeEyes, closeAllEyes}

    function makeEyes({driver, config, on}) {
      assert.ok(isDriver(driver), '"driver" is not a driver')

      on('setSizeWillStart', {viewportSize: config.viewportSize})
      on('setSizeEnded')
      on('initStarted')
      on('initEnded')
      on('testStarted', {sessionId: 'session-id'})

      test.config = config
      history.push({command: 'makeEyes', data: {driver, config}})

      return {
        check,
        locate,
        extractText,
        extractTextRegions,
        close,
        abort,
      }

      function check({settings = {}, config = {}} = {}) {
        test.steps.push({settings, config})
        history.push({command: 'check', data: {settings, config}})
        const asExpected = !settings.region || !settings.region.includes('diff')
        on('validationWillStart', {sessionId: 'session-id', validationInfo: {validationId: 0, tag: ''}})
        on('validationEnded', {sessionId: 'session-id', validationId: 0, validationResult: {asExpected}})
        return {asExpected}
      }

      function locate({settings, config}) {
        history.push({command: 'locate', data: {settings, config}})
        return []
      }

      function extractText({regions, config}) {
        history.push({command: 'extractText', data: {regions, config}})
        return []
      }

      function extractTextRegions({settings, config}) {
        history.push({command: 'extractTextRegions', data: {settings, config}})
        return {}
      }

      function close() {
        const isDifferent = test.steps.some(step => step.settings.region && step.settings.region.includes('diff'))
        const isNew = test.steps.some(step => step.settings.region && step.settings.region.includes('new'))
        const testResults = {
          id: 'test-id',
          name: 'test',
          batchId: 'batch-id',
          batchName: 'batch-name',
          duration: 0,
          startedAt: new Date(),
          appName: 'app',
          status: isDifferent ? 'Unresolved' : 'Passed',
          isNew,
          isDifferent,
          url: 'https://eyes.applitools.com',
        }

        on('testEnded', {sessionId: 'session-id', testResults})

        return testResults
      }

      function abort() {
        return {}
      }
    }

    function closeAllEyes() {
      return results
    }
  }

  async function getViewportSize(driver) {
    assert.ok(isDriver(driver), '"driver" is not a driver')
    history.push({command: 'getViewportSize', data: [driver], result: settings.viewportSize})
    return settings.viewportSize
  }

  async function setViewportSize(driver, viewportSize) {
    assert.ok(isDriver(driver), '"driver" is not a driver')
    assert.ok(
      utils.types.has(viewportSize, ['width', 'height']),
      '"viewportSize" must be an object with "width" and "height" properties',
    )
    settings.viewportSize = viewportSize
    history.push({command: 'setViewportSize', data: [driver, viewportSize]})
  }
}

module.exports = makeSDK
