function transformException(error) {
  if (error.info) {
    error.info = {...error.info, testResults: error.info.result, browserInfo: error.info.renderer}
  }
  return error
}

module.exports = transformException
