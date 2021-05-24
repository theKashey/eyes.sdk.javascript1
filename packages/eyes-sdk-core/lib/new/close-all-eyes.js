function makeCloseAllEyes({runner}) {
  return async function getResults() {
    const results = await runner.getAllTestResults(false)
    return results.getAllResults().map(results => {
      const container = results.toJSON()
      if (
        container.exception &&
        container.exception.getTestResults &&
        container.exception.getTestResults()
      ) {
        return container.exception.getTestResults().toJSON()
      }
      return container.testResults
    })
  }
}

module.exports = makeCloseAllEyes
