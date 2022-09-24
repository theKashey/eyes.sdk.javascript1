const transformException = require('./utils/transform-exception')

function makeCloseManager({manager}) {
  return async function closeManager({throwErr = false, logger} = {}) {
    try {
      const summary = await manager.closeManager({settings: {throwErr, logger}})
      summary.results = summary.results.map(result => {
        return {testResults: result.result, exception: transformException(result.error), browserInfo: result.renderer}
      })
      return summary
    } catch (error) {
      throw transformException(error)
    }
  }
}

module.exports = makeCloseManager
