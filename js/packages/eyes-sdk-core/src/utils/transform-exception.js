function transformException(error) {
  if (error.info) {
    error.info = {...error.info, testResult: error.info.result, browserInfo: error.info.renderer}
  }
  return error
}

module.exports = transformException
