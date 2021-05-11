const EyesSDK = require('../sdk/EyesSDK')

const makeMakeEyes = require('./make-eyes')
const makeGetViewportSize = require('./get-viewport-size')
const makeSetViewportSize = require('./set-viewport-size')
const makeCloseBatches = require('./close-batches')
const makeDeleteTestResults = require('./delete-test-results')

function makeSdk(options) {
  const sdk = EyesSDK(options)

  return {
    isDriver: options.spec.isDriver,
    isElement: options.spec.isElement,
    isSelector: options.spec.isSelector,
    makeEyes: makeMakeEyes(sdk),
    getViewportSize: makeGetViewportSize(sdk),
    setViewportSize: makeSetViewportSize(sdk),
    closeBatches: makeCloseBatches(sdk),
    deleteTestResults: makeDeleteTestResults(sdk),
  }
}

module.exports = makeSdk
