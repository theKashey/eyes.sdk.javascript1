const utils = require('@applitools/utils')
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
    // if it checks window and no DEFAULT value set in config, set fully true
    if (isCheckWindow && utils.types.isNull(eyes._configuration.getForceFullPageScreenshot())) {
      settings.fully = true
    }
    const result = await eyes.check(settings)
    return result ? result.toJSON() : new MatchResult().toJSON()
  }
}

module.exports = makeCheck
