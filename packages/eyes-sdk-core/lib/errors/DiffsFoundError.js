const EyesError = require('./EyesError')

/**
 * Indicates that an existing test ended, and that differences where found from the baseline.
 */
class DiffsFoundError extends EyesError {
  constructor(result) {
    const message = `Test '${result.name}' of '${result.appName}' detected differences! See details at: ${result.url}`
    super(message, {reason: 'test different', result})
  }
}

module.exports = DiffsFoundError
