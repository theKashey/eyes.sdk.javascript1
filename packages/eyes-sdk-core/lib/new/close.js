const DiffsFoundError = require('../errors/DiffsFoundError')
const NewTestError = require('../errors/NewTestError')
const TestFailedError = require('../errors/TestFailedError')

function makeClose({eyes}) {
  return async function close({throwErr = false} = {}) {
    let results = await eyes.close(false)

    if (!results) return []
    else if (!Array.isArray(results)) results = [results]

    return results.map(result => {
      result = result.toJSON()

      if (throwErr) {
        if (result.status === 'Unresolved') {
          if (result.isNew) throw new NewTestError(result)
          else throw new DiffsFoundError(result)
        } else if (result.status === 'Failed') {
          throw new TestFailedError(result)
        }
      }

      return results
    })
  }
}

module.exports = makeClose
