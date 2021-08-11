const EyesError = require('./EyesError')

/**
 * Indicates that a test did not pass (i.e., test either failed or is a new test).
 */
class TestFailedError extends EyesError {
  constructor(result) {
    const message = `Test '${result.name}' of '${result.appName}' is failed! See details at ${result.url}`
    super(message, {reason: 'test failed', result})
  }
}

module.exports = TestFailedError
