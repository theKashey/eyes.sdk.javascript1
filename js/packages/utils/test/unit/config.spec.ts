import * as path from 'path'
import * as assert from 'assert'
import {getConfig} from '../../src/config'

describe('config', () => {
  const originalEnv = process.env
  const originalCwd = process.cwd()
  const configDir = path.resolve(process.cwd(), './test/fixtures/config')

  beforeEach(() => {
    process.env = {}
  })

  afterEach(() => {
    process.chdir(originalCwd)
    process.env = originalEnv
  })

  it('loads config from default file', () => {
    process.chdir(configDir)
    const config = getConfig()
    const expectedConfig = {name: 'applitools.config.js', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with file in json format', () => {
    process.chdir(path.join(configDir, 'json-project'))
    const config = getConfig()
    const expectedConfig = {name: 'eyes.json', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with file in cjs format', () => {
    process.chdir(path.join(configDir, 'cjs-project'))
    const config = getConfig()
    const expectedConfig = {name: 'applitools.config.cjs', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config file from parent dir', () => {
    process.chdir(path.join(configDir, 'empty-project', 'empty-subproject'))
    const config = getConfig()
    const expectedConfig = {name: 'applitools.config.js', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with file path set by options', () => {
    process.chdir(configDir)
    const config = getConfig({paths: ['custom.config.js']})
    const expectedConfig = {name: 'custom.config.js', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with file path set by env variable', () => {
    process.env.APPLITOOLS_CONFIG_PATH = path.join(configDir, 'custom.config.js')
    const config = getConfig()
    const expectedConfig = {name: 'custom.config.js', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with dir path set by env variable', () => {
    process.env.APPLITOOLS_CONFIG_PATH = configDir
    const config = getConfig()
    const expectedConfig = {name: 'applitools.config.js', it: 'works'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with env variables', () => {
    const config = getConfig({paths: [], params: ['bla']})
    assert.strictEqual(config.bla, undefined)

    process.env.APPLITOOLS_BLA = 'aaa'
    const configWithBla = getConfig({paths: [], params: ['bla']})
    assert.strictEqual(configWithBla.bla, 'aaa')
  })

  it('loads config with env variables overrides', () => {
    process.env.APPLITOOLS_IT = 'works from env'
    const config = getConfig({paths: [path.join(configDir, 'applitools.config.js')], params: ['it']})
    const expectedConfig = {name: 'applitools.config.js', it: 'works from env'}
    assert.deepStrictEqual(config, expectedConfig)
  })

  it('loads config with env boolean env variables', () => {
    process.env.APPLITOOLS_BLA1 = 'false'
    process.env.APPLITOOLS_BLA2 = 'true'
    const configWithBla = getConfig({paths: [], params: ['bla1', 'bla2']})
    assert.strictEqual(configWithBla.bla1, false)
    assert.strictEqual(configWithBla.bla2, true)
  })

  it('throws if config is broken in strict mode', () => {
    assert.throws(
      () => getConfig({paths: [path.join(configDir, 'broken.config.js')], strict: true}),
      err => err.message.startsWith('Unexpected identifier'),
    )
  })

  it('throws if config is not found in strict mode', () => {
    assert.throws(
      () => getConfig({paths: [path.join(configDir, 'unknown.config.js')], params: ['bla'], strict: true}),
      err => err.message.startsWith('Could not find configuration file'),
    )
  })
})
