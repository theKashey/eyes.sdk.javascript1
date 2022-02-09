const MatchResult = require('../match/MatchResult')

function makeCheck({eyes}) {
  return async function check({settings, config} = {}) {
    if (config) {
      if (config.cut) {
        eyes.setCut(config.cut)
      }
      eyes._configuration.mergeConfig(config)
    }
    const isCheckWindow = !settings || (!settings.region && (!settings.frames || settings.frames.length === 0))
    settings = {fully: isCheckWindow, ...settings}
    const result = await eyes.check(settings)
    return result ? result.toJSON() : new MatchResult().toJSON()
  }
}

module.exports = makeCheck
