const path = require('path')
const {readFileSync} = require('fs')
const {writeFileSync} = require('fs')
const {getEntriesForHeading, getLatestReleaseHeading} = require('./query')

function addReleaseEntryForUnreleasedItems({changelogContents, version}) {
  const unreleasedEntries = getEntriesForHeading({
    changelogContents,
    targetHeading: '## Unreleased',
  })
  const indentationCount =
    unreleasedEntries[0].entry.length - unreleasedEntries[0].entry.trim().length
  const padding = new Array(indentationCount + 1).join(' ')
  const releaseEntry = [`${padding}## ${version}\n`, ...unreleasedEntries.map(entry => entry.entry)]
  const latestReleaseHeadingIndex = getLatestReleaseHeading(changelogContents).index
  const mutableChangelogContents = changelogContents.split('\n')
  mutableChangelogContents.splice(latestReleaseHeadingIndex - 1, 0, ...releaseEntry)
  return mutableChangelogContents.join('\n')
}

function addUnreleasedItem({changelogContents, entry, prepend}) {
  const unreleasedEntries = getEntriesForHeading({
    changelogContents,
    targetHeading: '## Unreleased',
    includeHeading: true,
  })
  const targetIndex = prepend
    ? unreleasedEntries[0].index + 1
    : unreleasedEntries[unreleasedEntries.length - 1].index + 1
  const mutableChangelogContents = changelogContents.split('\n')
  mutableChangelogContents.splice(targetIndex, 0, entry)
  return mutableChangelogContents.join('\n')
}

function removeUnreleasedItems({changelogContents}) {
  const unreleasedEntries = getEntriesForHeading({
    changelogContents,
    targetHeading: '## Unreleased',
  })
  const mutableChangelogContents = changelogContents.split('\n')
  const entryIndexes = unreleasedEntries.map(entry => entry.index)
  entryIndexes.reverse().forEach(index => {
    mutableChangelogContents.splice(index, 1)
  })
  return mutableChangelogContents.join('\n')
}

function createReleaseEntry({changelogContents, version, withDate}) {
  let mutableChangelogContents = changelogContents
  const now = new Date()
  let _version = withDate
    ? version + ` - ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`
    : version
  mutableChangelogContents = addReleaseEntryForUnreleasedItems({
    changelogContents: mutableChangelogContents,
    version: _version,
  })
  mutableChangelogContents = removeUnreleasedItems({changelogContents: mutableChangelogContents})
  return mutableChangelogContents
}

function writeReleaseEntryToChangelog(targetFolder, {withDate = true} = {}) {
  const changeLogFilePath = path.resolve(targetFolder, 'CHANGELOG.md')
  const changelogContents = readFileSync(changeLogFilePath, 'utf8')
  const {version} = require(path.resolve(targetFolder, 'package.json'))
  writeFileSync(changeLogFilePath, createReleaseEntry({changelogContents, version, withDate}))
}

function writeUnreleasedItemToChangelog({targetFolder, entry, prepend} = {}) {
  const changeLogFilePath = path.resolve(targetFolder, 'CHANGELOG.md')
  const changelogContents = readFileSync(changeLogFilePath, 'utf8')
  writeFileSync(changeLogFilePath, addUnreleasedItem({changelogContents, entry, prepend}))
}

module.exports = {
  addUnreleasedItem,
  createReleaseEntry,
  writeReleaseEntryToChangelog,
  writeUnreleasedItemToChangelog,
}
