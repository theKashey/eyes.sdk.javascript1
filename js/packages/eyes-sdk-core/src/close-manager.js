const transformException = require('./utils/transform-exception')

function makeCloseManager({manager}) {
  return async function closeManager({throwErr = false, logger} = {}) {
    try {
      const summary = await manager.closeManager({settings: {throwErr, logger}})
      summary.results = summary.results.map(result => {
        return {
          testResults: result.result,
          exception: result.error && transformException(result.error),
          browserInfo: result.renderer,
          userTestId: result.userTestId,
        }
      })
      return summary
    } catch (error) {
      throw transformException(error)
    }
  }
}

module.exports = makeCloseManager
