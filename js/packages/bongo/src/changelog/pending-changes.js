const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const {writeUnreleasedItemToChangelog} = require('./update')

function getSDKPackageNames(pendingChangesFilePath) {
  return Object.keys(loadPendingChanges(pendingChangesFilePath))
}

function loadPendingChanges(pendingChangesFilePath) {
  return JSON.parse(
    JSON.stringify(yaml.load(fs.readFileSync(pendingChangesFilePath))).replace(/null/g, ''),
  )
}

function getPendingChanges({packageName, cwd, pendingChangesFilePath} = {}) {
  const pendingChanges = loadPendingChanges(pendingChangesFilePath)
  if (packageName || cwd) {
    const pkgName = packageName || require(path.join(cwd, 'package.json')).name
    const pkg = pendingChanges[pkgName]
    if (!pkg) throw new Error('Package not found in pending changes')
    return pkg
  }
  return pendingChanges
}

function verifyPendingChanges({packageName, cwd, pendingChangesFilePath} = {}) {
  const entries = getPendingChanges({packageName, cwd, pendingChangesFilePath})
  if (!entries.feature.length && !entries['bug-fix'].length)
    throw new Error('No pending changes entries found in the changelog. Add some before releasing.')
}

function removePendingChanges({packageName, cwd, pendingChangesFilePath} = {}) {
  const pkgName = packageName || require(path.join(cwd, 'package.json')).name
  const entries = getPendingChanges({pendingChangesFilePath})
  entries[pkgName].feature = []
  entries[pkgName]['bug-fix'] = []
  fs.writeFileSync(
    pendingChangesFilePath,
    JSON.parse(
      JSON.stringify(
        yaml.dump(JSON.parse(JSON.stringify(entries).replace(/\[\]/g, '[ null ]')), {
          quotingType: '"',
          lineWidth: -1,
        }),
      ).replace(/null/g, ''),
    ),
  )
}

function emitPendingChangesEntry(changes = {feature: [], 'bug-fix': []}) {
  let changelogEntry = `### Features\n`
  changes.feature.forEach(entry => {
    changelogEntry += `- ${entry}\n`
  })
  changelogEntry += `### Bug fixes\n`
  changes['bug-fix'].forEach(entry => {
    changelogEntry += `- ${entry}\n`
  })
  return changelogEntry
}

function writePendingChangesToChangelog({cwd, packageName, pendingChangesFilePath}) {
  const pendingChanges = getPendingChanges({cwd, packageName, pendingChangesFilePath})
  const entry = emitPendingChangesEntry(pendingChanges)
  return writeUnreleasedItemToChangelog({targetFolder: cwd, entry, prepend: true})
}

module.exports = {
  emitPendingChangesEntry,
  getPendingChanges,
  getSDKPackageNames,
  removePendingChanges,
  verifyPendingChanges,
  writePendingChangesToChangelog,
}
