const {
  getEntriesForHeading,
  getLatestReleaseHeading,
  getReleaseNumberFromHeading,
  verifyChangelog,
  verifyChangelogContents,
  getLatestReleaseEntries,
} = require('../../src/changelog/query')
const {
  addUnreleasedItem,
  createReleaseEntry,
  writeReleaseEntryToChangelog,
} = require('../../src/changelog/update')
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const {
  emitPendingChangesEntry,
  getPendingChanges,
  verifyPendingChanges,
  removePendingChanges,
  writePendingChangesToChangelog,
} = require('../../src/changelog/pending-changes')
const pendingChangesFilePath = path.join(__dirname, 'fixtures/pending-changes.yaml')

describe('pending changes', () => {
  const cwd = path.resolve(process.cwd(), '..', 'eyes-selenium')
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
    it('updates a changelog with pending changes entries', () => {
      const originalChangelog = fs.readFileSync(path.join(cwd, 'CHANGELOG.md'), {encoding: 'utf-8'})
      try {
        writePendingChangesToChangelog({cwd, pendingChangesFilePath})
        const updatedChangelog = fs
          .readFileSync(path.join(cwd, 'CHANGELOG.md'), {
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
        fs.writeFileSync(path.join(cwd, 'CHANGELOG.md'), originalChangelog)
      }
    })
    it('updates a changelog with a release entry', () => {
      const originalChangelog = fs.readFileSync(path.join(cwd, 'CHANGELOG.md'), {encoding: 'utf-8'})
      try {
        writePendingChangesToChangelog({cwd, pendingChangesFilePath})
        writeReleaseEntryToChangelog(cwd, {withDate: false})
        const updatedChangelog = fs
          .readFileSync(path.join(cwd, 'CHANGELOG.md'), {
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
        fs.writeFileSync(path.join(cwd, 'CHANGELOG.md'), originalChangelog)
      }
    })
  })
})

describe('add-changelog-entry', () => {
  it('should append an entry to a populated unreleased section', () => {
    const changelogContents = `
# Changelog

## Unreleased
- a
- b

## 1.2.3 - date

- more blah
`
    const updatedChangelogContents = addUnreleasedItem({
      changelogContents,
      entry: '- blah blah',
    })
    const expectedChangelogContents = `
# Changelog

## Unreleased
- a
- b
- blah blah

## 1.2.3 - date

- more blah
`
    assert.deepStrictEqual(updatedChangelogContents, expectedChangelogContents)
  })
  it('should append an entry to an empty unreleased section', () => {
    const changelogContents = `
# Changelog

## Unreleased

## 1.2.3 - date

- more blah
`
    const updatedChangelogContents = addUnreleasedItem({
      changelogContents,
      entry: '- blah blah',
    })
    const expectedChangelogContents = `
# Changelog

## Unreleased
- blah blah

## 1.2.3 - date

- more blah
`
    assert.deepStrictEqual(updatedChangelogContents, expectedChangelogContents)
  })
  it('supports prepending an entry to a populated unreleased section', () => {
    const changelogContents = `
# Changelog

## Unreleased
- a
- b

## 1.2.3 - date

- more blah
`
    const updatedChangelogContents = addUnreleasedItem({
      changelogContents,
      entry: '- blah blah',
      prepend: true,
    })
    const expectedChangelogContents = `
# Changelog

## Unreleased
- blah blah
- a
- b

## 1.2.3 - date

- more blah
`
    assert.deepStrictEqual(updatedChangelogContents, expectedChangelogContents)
  })
})

describe('query-changelog', () => {
  it('should get entries for the latest release', () => {
    const changelogContents = `
      # Changelog

      ## Unreleased

      ## 1.2.3 - date

      - more blah

      ## [3.2.1] - date

      - some more blah as well
    `
    assert.deepStrictEqual(getLatestReleaseEntries(changelogContents), ['      - more blah'])
  })
})

describe('verify-changelog', () => {
  let changelogContents
  before(() => {
    changelogContents = `
      # Changelog

      ## Unreleased

      - blah
      - also blah

      ## 1.2.3 - date

      - more blah

      ## [3.2.1] - date

      - some more blah as well
    `
  })
  it('should get entries for an explicit heading', () => {
    assert.deepStrictEqual(
      getEntriesForHeading({changelogContents, targetHeading: '## Unreleased'}),
      [
        {entry: '      - blah', index: 5},
        {entry: '      - also blah', index: 6},
      ],
    )
    assert.deepStrictEqual(
      getEntriesForHeading({changelogContents, targetHeading: '## 1.2.3 - date'}),
      [{entry: '      - more blah', index: 10}],
    )
  })
  it('should get latest release heading', () => {
    const result = getLatestReleaseHeading(changelogContents)
    assert.deepStrictEqual(result.heading, '## 1.2.3 - date')
    assert.deepStrictEqual(result.index, 8)
  })
  it('should get version number from release heading', () => {
    assert.deepStrictEqual(getReleaseNumberFromHeading('## 1.2.3 - date'), '1.2.3')
    assert.deepStrictEqual(getReleaseNumberFromHeading('## [3.2.1] - date'), '3.2.1')
  })
  it('should throw if there are unreleased entries', () => {
    assert.throws(() => {
      verifyChangelogContents({changelogContents})
    }, /Invalid changelog entries found/)
  })
  it('should not throw if no changelog found', () => {
    assert.doesNotThrow(() => {
      verifyChangelog('blah')
    })
  })
})

describe('update-changelog', () => {
  let changelogContents
  before(() => {
    changelogContents = `
      # Changelog

      ## Unreleased
      - blah
      - also blah

      ## 1.2.3 - date

      - more blah

      ## [3.2.1] - date

      - some more blah as well
    `
  })
  it('should add release entry and move unreleased items into it', () => {
    const updatedChangelog = createReleaseEntry({
      changelogContents,
      version: '1.2.4',
    })
    const expectedChangelogContents = `
      # Changelog

      ## Unreleased
      ## 1.2.4

      - blah
      - also blah

      ## 1.2.3 - date

      - more blah

      ## [3.2.1] - date

      - some more blah as well
    `
    assert.deepStrictEqual(updatedChangelog, expectedChangelogContents)
  })
  it('should add release entry with date', () => {
    const updatedChangelog = createReleaseEntry({
      changelogContents,
      version: '1.2.4',
      withDate: true,
    })
    const date = () => {
      const now = new Date()
      return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`
    }
    const expectedChangelogContents = `
      # Changelog

      ## Unreleased
      ## 1.2.4 - ${date()}

      - blah
      - also blah

      ## 1.2.3 - date

      - more blah

      ## [3.2.1] - date

      - some more blah as well
    `
    assert.deepStrictEqual(updatedChangelog, expectedChangelogContents)
  })
})
