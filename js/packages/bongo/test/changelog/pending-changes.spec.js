const assert = require('assert')
const fs = require('fs')
const path = require('path')
const {
  emitPendingChangesEntry,
  getPendingChanges,
  getSDKPackageNames,
  verifyPendingChanges,
  removePendingChanges,
  writePendingChangesToChangelog,
} = require('../../src/changelog/pending-changes')
const pendingChangesFilePath = path.join(__dirname, 'fixtures/pending-changes.yaml')
const {writeReleaseEntryToChangelog} = require('../../src/changelog/update')

describe('pending changes', () => {
  const cwd = path.resolve(process.cwd(), '..', 'eyes-selenium')
  it('getSDKPackageNames', () => {
    assert.deepStrictEqual(getSDKPackageNames(pendingChangesFilePath), [
      '@applitools/eyes-cypress',
      '@applitools/eyes-nightwatch',
      '@applitools/eyes-playwright',
      '@applitools/eyes-protractor',
      '@applitools/eyes-puppeteer',
      '@applitools/eyes-selenium',
      '@applitools/eyes-storybook',
      '@applitools/eyes-testcafe',
      '@applitools/eyes-webdriverio',
    ])
  })
  it('gets entries', () => {
    const entries = getPendingChanges({pendingChangesFilePath})
    const expected = {
      '@applitools/eyes-cypress': {feature: [], 'bug-fix': []},
      '@applitools/eyes-nightwatch': {feature: [], 'bug-fix': []},
      '@applitools/eyes-playwright': {feature: [], 'bug-fix': []},
      '@applitools/eyes-protractor': {feature: [], 'bug-fix': []},
      '@applitools/eyes-puppeteer': {feature: [], 'bug-fix': []},
      '@applitools/eyes-selenium': {
        feature: ['feature 9001'],
        'bug-fix': ['fixed that one thing'],
      },
      '@applitools/eyes-storybook': {feature: [], 'bug-fix': []},
      '@applitools/eyes-testcafe': {feature: [], 'bug-fix': []},
      '@applitools/eyes-webdriverio': {feature: [], 'bug-fix': []},
    }
    assert.deepStrictEqual(entries, expected)
  })
  it('gets entries for a package by name', () => {
    const entries = getPendingChanges({
      packageName: '@applitools/eyes-selenium',
      pendingChangesFilePath,
    })
    assert.deepStrictEqual(entries, {
      feature: ['feature 9001'],
      'bug-fix': ['fixed that one thing'],
    })
  })
  it('gets entries for a package by cwd', () => {
    const entries = getPendingChanges({cwd, pendingChangesFilePath})
    assert.deepStrictEqual(entries, {
      feature: ['feature 9001'],
      'bug-fix': ['fixed that one thing'],
    })
  })
  it('errors when a package is not found', () => {
    assert.throws(
      () => getPendingChanges({packageName: '@applitools/eyes-sdk-core', pendingChangesFilePath}),
      /package not found/i,
    )
  })
  it('verifies an entry has been made to a package by name', () => {
    assert.doesNotThrow(() =>
      verifyPendingChanges({packageName: '@applitools/eyes-selenium', pendingChangesFilePath}),
    )
    assert.throws(
      () =>
        verifyPendingChanges({packageName: '@applitools/eyes-storybook', pendingChangesFilePath}),
      /no pending changes entries found/i,
    )
  })
  it('verifies an entry has been made to a package by cwd', () => {
    assert.doesNotThrow(() => verifyPendingChanges({cwd, pendingChangesFilePath}))
    const anotherCwd = path.resolve(process.cwd(), '..', 'eyes-storybook')
    assert.throws(
      () => verifyPendingChanges({cwd: anotherCwd, pendingChangesFilePath}),
      /no pending changes entries found/i,
    )
  })
  describe('emit', () => {
    it('should emit pending changes', () => {
      const entries = getPendingChanges({
        packageName: '@applitools/eyes-selenium',
        pendingChangesFilePath,
      })
      const expected = fs.readFileSync(
        path.join(__dirname, 'fixtures/emit-pending-changes-output'),
        {encoding: 'utf-8'},
      )
      assert.deepStrictEqual(emitPendingChangesEntry(entries), expected)
    })
    it('should emit empty blocks with headings', () => {
      const entries = getPendingChanges({
        packageName: '@applitools/eyes-storybook',
        pendingChangesFilePath,
      })
      const expected = fs.readFileSync(
        path.join(__dirname, 'fixtures/emit-pending-changes-output-when-empty'),
        {encoding: 'utf-8'},
      )
      assert.deepStrictEqual(emitPendingChangesEntry(entries), expected)
    })
  })
  describe('update', () => {
    const originalYaml = fs.readFileSync(pendingChangesFilePath, {encoding: 'utf-8'})
    afterEach(() => {
      fs.writeFileSync(pendingChangesFilePath, originalYaml)
    })
    it('removes entries for a package by name', () => {
      const packageName = '@applitools/eyes-selenium'
      assert.doesNotThrow(() => verifyPendingChanges({packageName, pendingChangesFilePath}))
      removePendingChanges({packageName, pendingChangesFilePath})
      assert.throws(
        () => verifyPendingChanges({packageName, pendingChangesFilePath}),
        /no pending changes entries found/i,
      )
      const expectedYaml = fs.readFileSync(
        path.join(__dirname, 'fixtures/expected-pending-changes.yaml'),
        {encoding: 'utf-8'},
      )
      const updatedYaml = fs.readFileSync(pendingChangesFilePath, {encoding: 'utf-8'})
      assert.deepStrictEqual(updatedYaml, expectedYaml)
    })
    it('removes entries for a package by cwd', () => {
      const packageName = '@applitools/eyes-selenium'
      assert.doesNotThrow(() => verifyPendingChanges({packageName, pendingChangesFilePath}))
      removePendingChanges({cwd, pendingChangesFilePath})
      assert.throws(
        () => verifyPendingChanges({packageName, pendingChangesFilePath}),
        /no pending changes entries found/i,
      )
      const expectedYaml = fs.readFileSync(
        path.join(__dirname, 'fixtures/expected-pending-changes.yaml'),
        {encoding: 'utf-8'},
      )
      const updatedYaml = fs.readFileSync(pendingChangesFilePath, {encoding: 'utf-8'})
      assert.deepStrictEqual(updatedYaml, expectedYaml)
    })
    it('preserves entries that are wide and contain free text', () => {
      const pendingChangesFilePath = path.join(
        __dirname,
        'fixtures/pending-changes-with-markdown.yaml',
      )
      const originalYaml = fs.readFileSync(pendingChangesFilePath, {encoding: 'utf-8'})
      const packageName = '@applitools/eyes-selenium'
      try {
        assert.doesNotThrow(() => verifyPendingChanges({packageName, pendingChangesFilePath}))
        removePendingChanges({cwd, pendingChangesFilePath})
        assert.throws(
          () => verifyPendingChanges({packageName, pendingChangesFilePath}),
          /no pending changes entries found/i,
        )
        const expectedYaml = fs.readFileSync(
          path.join(__dirname, 'fixtures/expected-pending-changes-with-markdown.yaml'),
          {encoding: 'utf-8'},
        )
        const updatedYaml = fs.readFileSync(pendingChangesFilePath, {encoding: 'utf-8'})
        assert.deepStrictEqual(updatedYaml, expectedYaml)
      } finally {
        fs.writeFileSync(pendingChangesFilePath, originalYaml)
      }
    })
    it('updates a changelog with pending changes entries', () => {
      const cwd = path.join(__dirname, 'fixtures')
      const changelogPath = path.join(__dirname, 'fixtures/CHANGELOG.md')
      const originalChangelog = fs.readFileSync(changelogPath, {encoding: 'utf-8'})
      try {
        writePendingChangesToChangelog({
          packageName: '@applitools/eyes-selenium',
          pendingChangesFilePath,
          cwd,
        })
        const updatedChangelog = fs
          .readFileSync(changelogPath, {
            encoding: 'utf-8',
          })
          .split('\n')
          .slice(0, 8)
          .join()
          .replace(/,/g, '\n')
        const expectedChangelog = fs.readFileSync(
          path.join(__dirname, 'fixtures/expected-changelog-unreleased.md'),
          {encoding: 'utf-8'},
        )
        assert.deepStrictEqual(updatedChangelog, expectedChangelog)
      } finally {
        fs.writeFileSync(changelogPath, originalChangelog)
      }
    })
    it('updates a changelog with a release entry', () => {
      const cwd = path.join(__dirname, 'fixtures')
      const changelogPath = path.join(__dirname, 'fixtures/CHANGELOG.md')
      const originalChangelog = fs.readFileSync(changelogPath, {encoding: 'utf-8'})
      try {
        writePendingChangesToChangelog({
          packageName: '@applitools/eyes-selenium',
          pendingChangesFilePath,
          cwd,
        })
        writeReleaseEntryToChangelog(cwd, {withDate: false})
        const updatedChangelog = fs
          .readFileSync(changelogPath, {
            encoding: 'utf-8',
          })
          .split('\n')
          .slice(0, 11)
          .join()
          .replace(/,/g, '\n')
        const expectedChangelog = fs.readFileSync(
          path.join(__dirname, 'fixtures/expected-changelog-released.md'),
          {encoding: 'utf-8'},
        )
        assert.deepStrictEqual(updatedChangelog, expectedChangelog)
      } finally {
        fs.writeFileSync(changelogPath, originalChangelog)
      }
    })
  })
})
