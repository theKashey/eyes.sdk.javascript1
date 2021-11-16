const path = require('path')
const spec = require('@applitools/spec-driver-playwright')

async function build(env) {
  return spec.build({...env, extension: path.resolve(process.cwd(), './dist')})
}

module.exports = {...spec, build}
