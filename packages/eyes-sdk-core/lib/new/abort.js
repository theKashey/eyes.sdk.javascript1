function makeAbort({eyes}) {
  return async function abort() {
    let results = await eyes.abort()

    if (!results) return []

    return results.map(result => result.toJSON())
  }
}

module.exports = makeAbort
