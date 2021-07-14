const MatchResult = require('../match/MatchResult')

function makeCheck({eyes}) {
  return async function check({settings, config} = {}) {
    if (config) eyes._configuration.mergeConfig(config)
    const result = await eyes.check(settings)
    return result ? result.toJSON() : new MatchResult().toJSON()
  }
}

module.exports = makeCheck
