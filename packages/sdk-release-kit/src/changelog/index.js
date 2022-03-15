const {getLatestReleaseEntries, verifyChangelog} = require('./query')
const {writeReleaseEntryToChangelog, writeUnreleasedItemToChangelog} = require('./update')
const {
  removePendingChanges,
  verifyPendingChanges,
  writePendingChangesToChangelog,
} = require('./pending-changes')

module.exports = {
  removePendingChanges,
  getLatestReleaseEntries,
  verifyChangelog,
  verifyPendingChanges,
  writePendingChangesToChangelog,
  writeReleaseEntryToChangelog,
  writeUnreleasedItemToChangelog,
}
