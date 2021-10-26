const closeBatch = require('../close/closeBatch')

function makeCloseBatches() {
  return function closeBatches({settings, logger}) {
    return closeBatch({...settings, logger})
  }
}

module.exports = makeCloseBatches
