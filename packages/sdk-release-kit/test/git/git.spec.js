const assert = require('assert')
const {
  findPackageVersionNumbers,
  gitLog,
  gitStatus,
  isChanged,
  expandAutoCommitLogEntry,
} = require('../../src/git')
const jsonFile = require('./fixtures/changed.json')
const path = require('path')
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const fs = require('fs').promises

async function randomizeJson() {
  const json = {...jsonFile}
  json.change = Math.random(1)
  await fs.writeFile(path.join(__dirname, 'fixtures/changed.json'), JSON.stringify(json, null, 2))
}

describe('git', () => {
  describe('tag', () => {
    it('gets package versions by package name', async () => {
      const result = await findPackageVersionNumbers({packageName: '@applitools/eyes-sdk-core'})
      assert.ok(result.length > 2)
      assert.ok(result[0] != result[1])
      assert.ok(/\d+\.\d+\.\d+/.test(result[0]))
      assert.ok(/\d+\.\d+\.\d+/.test(result[1]))
    })
    it('gets package versions by cwd', async () => {
      const cwd = path.resolve(process.cwd(), '..', 'eyes-sdk-core')
      const result = await findPackageVersionNumbers({cwd})
      assert.ok(result.length > 2)
      assert.ok(result[0] != result[1])
      assert.ok(/\d+\.\d+\.\d+/.test(result[0]))
      assert.ok(/\d+\.\d+\.\d+/.test(result[1]))
    })
  })
  describe('log', () => {
    it('should get filtered commits for a package by a range of version numbers', async () => {
      const result = await gitLog({
        packageName: '@applitools/types',
        lowerVersion: '1.0.23',
        upperVersion: '1.0.24',
      })
      assert.deepStrictEqual(result, [
        '0767609bd [auto commit] @applitools/types: upgrade deps',
        '35aa793f9 [api, types] add new ufg devices',
      ])
    })
    it('should work with cwd', async () => {
      const cwd = path.resolve(process.cwd(), '..', 'types')
      const result = await gitLog({
        cwd,
        lowerVersion: '1.0.23',
        upperVersion: '1.0.24',
      })
      assert.deepStrictEqual(result, [
        '0767609bd [auto commit] @applitools/types: upgrade deps',
        '35aa793f9 [api, types] add new ufg devices',
      ])
    })
    it('should not get underlying commits for `upgrade deps` auto commit when they are devDependencies', async () => {
      assert.deepStrictEqual(
        await expandAutoCommitLogEntry('0767609bd [auto commit] @applitools/types: upgrade deps'),
        [],
      )
    })
    it('should get underlying commits for `upgrade deps` auto commit when they are dependencies', async () => {
      const logEntry = 'ba0aa7fc2 [auto commit] @applitools/eyes-sdk-core: upgrade deps'
      const result = await expandAutoCommitLogEntry(logEntry)
      assert.deepStrictEqual(result, [
        '74e991ad1 handle case with `spec.getCookies` throws an error when trying to get cookies of the browser',
      ])
    })
    it('should work when transitive dependencies updated', async () => {
      assert.deepStrictEqual(
        await expandAutoCommitLogEntry(
          'cf8702f6f [auto commit] @applitools/snippets: upgrade deps',
        ),
        [],
      )
    })
    it('should get a consolidated list of commits for a package given a version range', async () => {
      assert.deepStrictEqual(
        await gitLog({
          packageName: '@applitools/types',
          lowerVersion: '1.0.23',
          upperVersion: '1.0.24',
          expandAutoCommitLogEntries: true,
        }),
        ['35aa793f9 [api, types] add new ufg devices'],
      )
      assert.deepStrictEqual(
        await gitLog({
          packageName: '@applitools/eyes-sdk-core',
          lowerVersion: '12.24.12',
          upperVersion: '12.24.13',
          expandAutoCommitLogEntries: true,
        }),
        [
          '74e991ad1 handle case with `spec.getCookies` throws an error when trying to get cookies of the browser',
        ],
      )
    })
    it('should include external dep updates in consolidated list of commits', async () => {
      const result = await gitLog({
        packageName: '@applitools/eyes-sdk-core',
        lowerVersion: '12.24.10',
        upperVersion: '12.24.11',
        expandAutoCommitLogEntries: true,
      })
      const expected = 'ff7e580c6 updated to @applitools/dom-snapshot@4.5.12 (from 4.5.11)'
      assert.ok(result.includes(expected))
    })
  })
  describe('status', () => {
    afterEach(async () => {
      await fs.writeFile(
        path.join(__dirname, 'fixtures/changed.json'),
        JSON.stringify(jsonFile, null, 2),
      )
    })

    it('should get changed files', async () => {
      await randomizeJson()
      const changed = await isChanged('test/git/fixtures/changed.json')
      assert.strictEqual(changed, true)
    })

    it('should do git status', async () => {
      await randomizeJson()
      const {stdout} = await gitStatus()
      assert(stdout.includes('changed.json'))
    })
  })
})
