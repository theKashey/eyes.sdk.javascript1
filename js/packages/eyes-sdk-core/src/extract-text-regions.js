const transformConfig = require('./utils/transform-config')

function makeExtractTextRegions({eyes, config: defaultConfig}) {
  return async function extractTextRegions({settings, config = defaultConfig} = {}) {
    const transformedConfig = transformConfig(config)
    return eyes.locateText({settings, config: transformedConfig})
  }
}

module.exports = makeExtractTextRegions
