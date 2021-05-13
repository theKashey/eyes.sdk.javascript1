const path = require('path')
const {isUrl, requireUrl} = require('../common-util')

async function specEmitterLoader({emitter: emitterPath}) {
  return isUrl(emitterPath)
    ? requireUrl(emitterPath)
    : require(path.join(path.resolve('.'), emitterPath))
}

exports.specEmitterLoader = specEmitterLoader
