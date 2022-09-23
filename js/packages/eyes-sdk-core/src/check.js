const transformConfig = require('./utils/transform-config')
const transformCheckSettings = require('./utils/transform-check-settings')

function makeCheck({eyes, config: defaultConfig}) {
  return async function check({settings, config = defaultConfig} = {}) {
    const transformedConfig = transformConfig(config)
    const transformedSettings = settings && transformCheckSettings(settings)
    return eyes.check({settings: transformedSettings, config: transformedConfig})
  }
}

module.exports = makeCheck
