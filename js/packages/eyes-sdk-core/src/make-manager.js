const makeOpenEyes = require('./open-eyes')
const makeCloseManager = require('./close-manager')

function makeMakeManager({core}) {
  return async function makeManager({type, concurrency, legacyConcurrency} = {}) {
    const manager = await core.makeManager({type: type === 'vg' ? 'ufg' : type, concurrency, legacyConcurrency})

    return {
      openEyes: makeOpenEyes({core, manager}),
      closeManager: makeCloseManager({manager}),
    }
  }
}

module.exports = makeMakeManager
