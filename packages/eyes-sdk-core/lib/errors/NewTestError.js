const EyesError = require('./EyesError')

/**
 * Indicates that a new test (i.e., a test for which no baseline exists) ended.
 */
class NewTestError extends EyesError {
  constructor(result) {
    const message = `Test '${result.name}' of '${result.appName}' is new! Please approve the new baseline at ${result.url}`
    super(message, {reason: 'test new', result})
  }
}

module.exports = NewTestError
