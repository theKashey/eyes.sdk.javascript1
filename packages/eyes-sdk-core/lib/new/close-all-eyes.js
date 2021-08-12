const DiffsFoundError = require('../errors/DiffsFoundError')
const NewTestError = require('../errors/NewTestError')
const TestFailedError = require('../errors/TestFailedError')

function makeCloseAllEyes({runner}) {
  return async function closeAllEyes({throwErr = false} = {}) {
    const results = await runner.getAllTestResults()
    results.forEach(result => {
      if (throwErr) {
        if (result.status === 'Unresolved') {
          if (result.isNew) throw new NewTestError(result)
          else throw new DiffsFoundError(result)
        } else if (result.status === 'Failed') {
          throw new TestFailedError(result)
        }
      }
    })

    return results
  }
}

module.exports = makeCloseAllEyes
