function makeConsoleLogger() {
  return {log, warn, error}

  function log(message) {
    console.log(message)
  }

  function warn(message) {
    console.warn(message)
  }

  function error(message) {
    console.error(message)
  }
}

module.exports = makeConsoleLogger
