const {exec} = require('child_process')
const {promisify} = require('util')
const pexec = promisify(exec)
const path = require('path')
const {makePackagesList} = require('../versions/versions-utils')
const compareVersions = require('compare-versions')
const packages = makePackagesList()
const isAutoCommit = entry => /[auto commit].*upgrade deps/.test(entry)
const isReleaseCommit = entry => /@applitools\/.*@\d+\.\d+\.\d+$/.test(entry)
const isInternalPackage = packageName => !!packages.find(pkg => pkg.name === packageName)
const isInvalidPackageName = dep => !dep.match(/"(.*)":/)
const hasInvalidPackageVersion = dep => !dep.match(/: "(.*)"/)
const getPackagePath = packageName => {
  const pkg = packages.find(pkg => pkg.name === packageName)
  if (!pkg) throw new Error('Invalid package name provided')
  return pkg.path
}

async function expandAutoCommitLogEntry(logEntry) {
  const entry = logEntry.split(' ')
  const sha = entry[0]
  const packageName = entry[3].slice(0, -1)
  const pkgJsonPath = path.join(getPackagePath(packageName), 'package.json')
  const {dependencies} = require(pkgJsonPath)
  const stdout = await gitShow({sha, targetPath: pkgJsonPath})
  const currentDeps = stdout.match(/\+ *"(.*)"/g)
  const previousDeps = stdout.match(/\- *"(.*)"/g)
  if (!currentDeps && !previousDeps) return []
  let deps = currentDeps
    .map(dep => {
      if (isInvalidPackageName(dep) || hasInvalidPackageVersion(dep)) return
      const packageName = dep.match(/"(.*)":/)[1]
      const upperVersion = dep.match(/: "(.*)"/)[1]
      const packagePath = isInternalPackage(packageName) ? getPackagePath(packageName) : undefined
      return {packageName, upperVersion, packagePath}
    })
    .filter(dep => dep)
  previousDeps.forEach(dep => {
    if (isInvalidPackageName(dep) || hasInvalidPackageVersion(dep)) return
    const packageName = dep.match(/"(.*)":/)[1]
    const lowerVersion = dep.match(/: "(.*)"/)[1]
    const index = deps.findIndex(dep => dep.packageName === packageName)
    deps[index].lowerVersion = lowerVersion
  })
  const internalDeps = deps.filter(
    dep => dep.packageName in dependencies && isInternalPackage(dep.packageName),
  )
  const externalDeps = deps.filter(
    dep => dep.packageName in dependencies && !isInternalPackage(dep.packageName),
  )
  let entries = []
  for (const dep of internalDeps) {
    let results = await gitLog(dep)
    // expand auto-commits
    if (results.find(entry => isAutoCommit(entry))) {
      const autoCommits = results.filter(entry => isAutoCommit(entry))
      for (const commit of autoCommits) {
        const moreResults = await expandAutoCommitLogEntry(commit)
        entries.push(...moreResults)
      }
      // remove auto commits
      results = results.filter(entry => !isAutoCommit(entry))
    }
    entries.push(...results)
  }
  for (const dep of externalDeps) {
    const entry = `${sha} updated to ${dep.packageName}@${dep.upperVersion} (from ${dep.lowerVersion})`
    entries.push(entry)
  }
  // remove release commits & duplicates
  return [...new Set(entries.filter(entry => !isReleaseCommit(entry)))]
}

async function gitAdd(target) {
  await pexec(`git add ${target}`)
}

async function gitCommit(message = 'Committed with sdk-release-kit') {
  await pexec(`git commit -m "${message}"`)
}

async function gitLog({
  cwd,
  packageName,
  lowerVersion,
  upperVersion,
  expandAutoCommitLogEntries,
} = {}) {
  const pkgName = packageName || require(path.join(cwd, 'package.json')).name
  const packagePath = getPackagePath(pkgName)
  const exclusions = `":(exclude,icase)../*/changelog.md" ":!../*/test/*"`
  const command = `git log --oneline --grep ${pkgName}@${upperVersion} --invert-grep ${pkgName}@${lowerVersion}..${pkgName}@${upperVersion} -- ${packagePath} ${exclusions}`
  const {stdout} = await pexec(command)
  const entries = stdout && stdout.split('\n').filter(entry => entry)
  if (!expandAutoCommitLogEntries) return entries
  let results = []
  for (const entry of entries) {
    isAutoCommit(entry)
      ? results.push(...(await expandAutoCommitLogEntry(entry)))
      : results.push(entry)
  }
  // remove release commits & duplicates
  return [...new Set(results.filter(entry => !isReleaseCommit(entry)))]
}

async function gitPullWithRebase() {
  await pexec(`git pull --rebase`)
}

async function gitPushWithTags() {
  await pexec(`git push --follow-tags`)
}

async function gitShow({sha, targetPath}) {
  const {stdout} = await pexec(`git show ${sha} -- ${targetPath}`)
  return stdout
}

async function gitStatus() {
  return await pexec(`git status --short`)
}

async function gitTag({packageName}) {
  const grepCmd = process.platform.startsWith('win') ? 'findstr' : 'grep'
  const {stdout} = await pexec(`git tag | ${grepCmd} ${packageName}@`)
  return stdout
}

async function findPackageVersionNumbers({packageName, cwd}) {
  const pkgName = packageName || require(path.join(cwd, 'package.json')).name
  const stdout = await gitTag({packageName: pkgName})
  return stdout
    .split('\n')
    .filter(tag => tag)
    .map(tag => tag.match(/\d+.*/)[0])
    .sort(compareVersions)
    .reverse()
}

async function isChanged(...files) {
  const {stdout} = await gitStatus()
  const modifiedFiles = stdout.split('\n').map(line => line.trim())
  return files.some(file => new RegExp(`M *${file}`).test(modifiedFiles))
}

module.exports = {
  expandAutoCommitLogEntry,
  findPackageVersionNumbers,
  gitAdd,
  gitCommit,
  gitLog,
  gitPullWithRebase,
  gitPushWithTags,
  gitStatus,
  gitTag,
  isChanged,
}
