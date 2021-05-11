const closeBatch = require('../close/closeBatch')

function makeCloseBatches() {
  return function closeBatches(options) {
    return closeBatch(options)
  }
}

module.exports = makeCloseBatches
