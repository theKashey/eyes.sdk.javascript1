function makeDeleteTest({core}) {
  return async function deleteTest({settings, logger}) {
    await core.deleteTest({settings, logger})
  }
}

module.exports = makeDeleteTest
