const transformConfig = require('./utils/transform-config')

function makeClose({eyes, config: defaultConfig}) {
  return async function close({throwErr = false, config = defaultConfig, logger} = {}) {
    try {
      const transformedConfig = transformConfig(config)
      return await eyes.close({settings: {throwErr}, config: transformedConfig, logger})
    } catch (error) {
      if (error.info) {
        error.info = {...error.info, testResults: error.info.result, browserInfo: error.info.renderer}
      }
      throw error
    }
  }
}

module.exports = makeClose
