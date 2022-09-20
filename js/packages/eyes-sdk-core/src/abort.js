function makeAbort({eyes}) {
  return async function abort() {
    return eyes.abort()
  }
}

module.exports = makeAbort
