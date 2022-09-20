const {makeCore} = require('@applitools/core')

const makeMakeManager = require('./make-manager')
const makeGetViewportSize = require('./get-viewport-size')
const makeSetViewportSize = require('./set-viewport-size')
const makeCloseBatches = require('./close-batches')
const makeDeleteTest = require('./delete-test')

function makeSdk(options) {
  const core = makeCore({
    agentId: `${options.name}/${options.version}`,
    cwd: options.cwd,
    spec: options.spec,
    logger: options.logger,
  })

  return {
    isDriver: options.spec.isDriver,
    isElement: options.spec.isElement,
    isSelector: options.spec.isSelector,
    makeManager: makeMakeManager({core}),
    getViewportSize: makeGetViewportSize({core}),
    setViewportSize: makeSetViewportSize({core}),
    closeBatches: makeCloseBatches({core}),
    deleteTest: makeDeleteTest({core}),
  }
}

module.exports = makeSdk
