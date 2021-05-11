function makeClose({eyes}) {
  return async function close() {
    const result = await eyes.close(false)
    return result ? result.toJSON() : null
  }
}

module.exports = makeClose
