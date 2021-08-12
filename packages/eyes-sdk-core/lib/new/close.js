const DiffsFoundError = require('../errors/DiffsFoundError')
const NewTestError = require('../errors/NewTestError')
const TestFailedError = require('../errors/TestFailedError')

function makeClose({eyes}) {
  return async function close({throwErr = false} = {}) {
    let results = await eyes.close()

    if (!results) return []

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

      return result
    })
  }
}

module.exports = makeClose
