const path = require('path')
const {isUrl, requireUrl} = require('../common-util')

function configLoader({config: configPath}) {
  const config = isUrl(configPath)
    ? requireUrl(configPath)
    : require(path.join(path.resolve('.'), configPath))

  if (config.outPath || config.output) {
    config.outDir = config.outPath || config.output
  }
  if (config.metaPath) {
    config.metaDir = config.metaPath
  }
  if (config.resultPath) {
    config.resultDir = config.resultPath
  }

  if (config.extends) {
    const baseConfig = configLoader({config: config.extends})
    return Object.assign(baseConfig, config)
  }

  return config
}

exports.configLoader = configLoader
