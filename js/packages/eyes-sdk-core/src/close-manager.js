function makeCloseManager({manager}) {
  return async function closeManager({throwErr = false, logger} = {}) {
    try {
      const summary = await manager.closeManager({settings: {throwErr, logger}})
      summary.results = summary.results.map(result => {
        return {...result, testResults: result.result, exception: result.error, browserInfo: result.renderer}
      })
      return summary
    } catch (error) {
      if (error.info) {
        error.info = {...error.info, testResults: error.info.result, browserInfo: error.info.renderer}
      }
      throw error
    }
  }
}

module.exports = makeCloseManager
