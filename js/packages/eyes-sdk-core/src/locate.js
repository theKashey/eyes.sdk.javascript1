const transformConfig = require('./utils/transform-config')

function makeLocate({core, config: defaultConfig, driver}) {
  return async function locate({settings, config = defaultConfig}) {
    const transformedConfig = transformConfig(config)
    return core.locate({target: driver, settings, config: transformedConfig})
  }
}

module.exports = makeLocate
