function makeGetResults({runner}) {
  return async function getResults() {
    const results = await runner.getAllTestResults(false)
    return results.getAllResults().map(results => {
      const container = results.toJSON()
      if (
        container.exception &&
        container.exception.getTestResults &&
        container.exception.getTestResults()
      ) {
        return {testResults: container.exception.getTestResults().toJSON(), exception: null}
      }
      return container
    })
  }
}

module.exports = makeGetResults
