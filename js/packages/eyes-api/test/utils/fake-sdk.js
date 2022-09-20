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
    locate,
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
    return utils.types.isString(selector) || utils.types.has(selector, 'fakeSelector')
  }

  function makeManager(config) {
    const test = {
      steps: [],
    }

    history.push({command: 'makeManager', data: config})

    return {openEyes, closeManager}

    function openEyes({target, config, on}) {
      assert.ok(isDriver(target), '"driver" is not a driver')

      on('setSizeWillStart', {viewportSize: config.viewportSize})
      on('setSizeEnded')
      on('initStarted')
      on('initEnded')
      on('testStarted', {sessionId: 'session-id'})

      test.config = config
      history.push({command: 'openEyes', data: {target, config}})

      return {
        check,
        locate,
        extractText,
        locateText,
        close,
        abort,
      }

      function check({settings = {}, config = {}} = {}) {
        test.steps.push({settings, config})
        history.push({command: 'check', data: {settings, config}})
        const asExpected = !settings.region || !settings.region.includes('diff')
        on('validationWillStart', {sessionId: 'session-id', validationInfo: {validationId: 0, tag: ''}})
        on('validationEnded', {sessionId: 'session-id', validationId: 0, validationResult: {asExpected}})
        return [{asExpected}]
      }

      function extractText({regions, config}) {
        history.push({command: 'extractText', data: {regions, config}})
        return []
      }

      function locateText({settings, config}) {
        history.push({command: 'locateText', data: {settings, config}})
        return {}
      }

      function close({settings = {}} = {}) {
        const isDifferent = test.steps.some(step => step.settings.region && step.settings.region.includes('diff'))
        const isNew = test.steps.some(step => step.settings.region && step.settings.region.includes('new'))
        const result = {
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

        on('testEnded', {sessionId: 'session-id', result})

        if (settings.throwErr && result.status === 'Unresolved') {
          const error = new Error('error')
          error.reason = 'test different'
          error.info = {result}
          throw error
        }

        return [result]
      }

      function abort() {
        return {}
      }
    }

    function closeManager() {
      return {results: []}
    }
  }

  function locate({settings, config}) {
    history.push({command: 'locate', data: {settings, config}})
    return []
  }

  async function getViewportSize({target}) {
    assert.ok(isDriver(target), '"driver" is not a driver')
    history.push({command: 'getViewportSize', data: [target], result: settings.viewportSize})
    return settings.viewportSize
  }

  async function setViewportSize({target, size}) {
    assert.ok(isDriver(target), '"driver" is not a driver')
    assert.ok(
      utils.types.has(size, ['width', 'height']),
      '"size" must be an object with "width" and "height" properties',
    )
    settings.viewportSize = size
    history.push({command: 'setViewportSize', data: [target, size]})
  }
}

module.exports = makeSDK
