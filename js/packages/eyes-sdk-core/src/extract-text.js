const transformConfig = require('./utils/transform-config')

function makeExtractText({eyes, config: defaultConfig}) {
  return async function extractText({regions, config = defaultConfig} = {}) {
    const transformedConfig = transformConfig(config)
    const settings = regions.map(region => ({...region, region: region.target}))
    return eyes.extractText({settings, config: transformedConfig})
  }
}

module.exports = makeExtractText
