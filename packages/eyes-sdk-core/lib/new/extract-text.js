function makeExtractText({eyes}) {
  return async function extractText({regions, config}) {
    eyes._configuration.mergeConfig(config)
    return eyes.extractText(regions)
  }
}

module.exports = makeExtractText
