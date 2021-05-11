function makeExtractTextRegions({eyes}) {
  return async function extractTextRegions({settings, config}) {
    eyes._configuration.mergeConfig(config)
    return eyes.extractTextRegions(settings)
  }
}

module.exports = makeExtractTextRegions
