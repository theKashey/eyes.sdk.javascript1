import * as fs from 'fs'
import * as path from 'path'
import * as types from './types'
import * as general from './general'

export function getConfig({
  paths = ['applitools.config.js', 'eyes.config.js', 'eyes.json'],
  params = [],
  strict = false,
  logger = console,
}: {paths?: string[]; params?: string[]; strict?: boolean; logger?: any} = {}): Record<string, any> {
  let baseDir = process.cwd()
  const envPath = general.getEnvValue('CONFIG_PATH')

  if (envPath) {
    if (fs.statSync(envPath).isDirectory()) {
      baseDir = envPath
    } else {
      paths = [general.getEnvValue('CONFIG_PATH')]
    }

    strict = true
  }

  paths = paths.map(probablePath => path.resolve(baseDir, probablePath))
  const priorityPath = paths.find(probablePath => fs.existsSync(probablePath))

  let config: Record<string, any> = {}
  if (priorityPath) {
    try {
      const moduleCache = require.cache[priorityPath]
      delete require.cache[priorityPath]
      config = {...config, ...require(priorityPath)}
      require.cache[priorityPath] = moduleCache
    } catch (error) {
      logger.error(`An error occurred while loading configuration file (${priorityPath}):`, error)
      if (strict) throw error
    }
  } else if (strict) {
    logger.error(`Could not find configuration file at: ${paths.join(', ')}`)
    throw new Error('Could not find configuration file')
  }

  params.forEach(param => {
    const value = general.getEnvValue(param.replace(/(.)([A-Z])/g, '$1_$2').toUpperCase())
    if (!types.isNotDefined(value)) {
      config[param] = Number(value) || (value === 'true' ? true : value === 'false' ? false : value)
    }
  })

  return config
}
