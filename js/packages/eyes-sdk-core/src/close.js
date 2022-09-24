const transformConfig = require('./utils/transform-config')
const transformException = require('./utils/transform-exception')

function makeClose({eyes, config: defaultConfig}) {
  return async function close({throwErr = false, config = defaultConfig} = {}) {
    try {
      const transformedConfig = transformConfig(config)
      return await eyes.close({settings: {throwErr}, config: transformedConfig})
    } catch (error) {
      throw transformException(error)
    }
  }
}

module.exports = makeClose
