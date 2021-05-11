function makeAbort({eyes}) {
  return async function abort() {
    let result = await eyes.abort()
    if (Array.isArray(result)) [result] = result
    return result ? result.toJSON() : null
  }
}

module.exports = makeAbort
