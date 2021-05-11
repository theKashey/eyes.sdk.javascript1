const VisualGridRunner = require('../runner/VisualGridRunner')
const ClassicRunner = require('../runner/ClassicRunner')

const makeOpen = require('./open')
const makeGetResults = require('./get-results')

function makeMakeEyes(sdk) {
  return function makeEyes({type, concurrency, legacy}) {
    const runner =
      type === 'vg'
        ? new VisualGridRunner(legacy ? concurrency : {testConcurrency: concurrency})
        : new ClassicRunner()

    return {
      open: makeOpen({sdk, runner}),
      getResults: makeGetResults({sdk, runner}),
    }
  }
}

module.exports = makeMakeEyes
