const transformConfig = require('./utils/transform-config')

function makeLocate({core}) {
  return async function locate({settings, config, logger}) {
    const transformedConfig = transformConfig(config)
    return core.locate({settings, config: transformedConfig, logger})
  }
}

module.exports = makeLocate
