#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const {
  removePendingChanges,
  verifyChangelog,
  verifyPendingChanges,
  writePendingChangesToChangelog,
  writeReleaseEntryToChangelog,
} = require('../changelog')
const {packInstall, lsDryRun} = require('../dry-run')
const {lint} = require('../lint')
const sendReleaseNotification = require('../send-report')
const {createDotFolder} = require('../setup')
const {verifyCommits, verifyInstalledVersions, verifyVersions} = require('../versions')
const {gitAdd, gitCommit, gitPushWithTags, isChanged, gitStatus} = require('../git')
const {yarnInstall, yarnUpgrade, verifyUnfixedDeps} = require('../yarn')
const pendingChangesFilePath = path.join(process.cwd(), '..', '..', 'pending-changes.yaml')
const log = require('../log')
const released = require('../released')

yargs
  .config({cwd: process.cwd()})
  .command(
    ['released', 'release'],
    'Show which SDK versions contain a given package version or commit',
    {
      filterBySDK: {type: 'boolean', default: true},
      packageName: {alias: 'p', type: 'string'},
      sha: {type: 'string'},
      version: {alias: 'v', type: 'number'},
      versionsBack: {alias: 'n', type: 'number', default: 1},
    },
    async args => {
      await released({args, pendingChangesFilePath})
    },
  )
  .command(
    ['log', 'logs'],
    'Show commit logs for a given package',
    {
      packageName: {alias: 'p', type: 'string'},
      lowerVersion: {alias: 'lv', type: 'string'},
      upperVersion: {alias: 'uv', type: 'string'},
      expandAutoCommitLogEntries: {alias: 'expand', type: 'boolean', default: true},
      versionsBack: {alias: 'n', type: 'number', default: 3},
      listVersions: {alias: 'lsv', type: 'boolean'},
      splitByVersion: {alias: 'split', type: 'boolean', default: true},
    },
    async args => {
      await log(args)
    },
  )
  .command(
    ['preversion', 'release-pre-check', 'pre-version'],
    'Run all verification checks pre-release',
    {
      skipVerifyInstalledVersions: {alias: 'sviv', type: 'boolean'},
      skipVerifyVersions: {alias: 'svv', type: 'boolean'},
      skipDeps: {alias: 'sd', type: 'boolean'},
      skipCommit: {alias: 'sc', type: 'boolean', default: false},
      verifyPendingChanges: {type: 'boolean', default: false},
    },
    async args => {
      const {cwd} = args
      if (!args.skipDeps) {
        console.log('[bongo preversion] yarn install')
        await yarnInstall()
      }
      console.log('[bongo preversion] lint')
      await lint(cwd)
      if (args.verifyPendingChanges) {
        console.log('[bongo preversion] verify changelog')
        verifyChangelog(cwd)
        console.log('[bongo preversion] verify pending changes')
        verifyPendingChanges({cwd, pendingChangesFilePath})
      }
      console.log('[bongo preversion] verify unfixed dependencies')
      verifyUnfixedDeps(cwd)
      if (!args.skipVerifyVersions) {
        console.log('[bongo preversion] verify commits')
        await verifyCommits({pkgPath: cwd}).catch(err => console.log(err.message))
      }
      try {
        console.log('[bongo preversion] verify versions')
        verifyVersions({pkgPath: cwd})
      } catch (err) {
        console.log(chalk.yellow(err.message))
      }
      if (!args.skipVerifyInstalledVersions) {
        console.log('[bongo preversion] verify installed versions')
        createDotFolder(cwd)
        await packInstall(cwd)
        await verifyInstalledVersions({
          pkgPath: cwd,
          installedDirectory: path.join('.bongo', 'dry-run'),
        })
      }
      await commitFiles(args)
      console.log('[bongo preversion] done!')
    },
  )
  .command(
    ['update-changelog'],
    'Create changelog entry with what is in pending changes',
    {},
    async ({cwd}) => {
      verifyChangelog(cwd)
      verifyPendingChanges({cwd, pendingChangesFilePath})

      writePendingChangesToChangelog({cwd, pendingChangesFilePath})
      removePendingChanges({cwd, pendingChangesFilePath})
      writeReleaseEntryToChangelog(cwd)

      await gitAdd(pendingChangesFilePath)
      await gitAdd('CHANGELOG.md')
      await gitCommit('[auto commit] updated changelog')
    },
  )
  .command(
    ['version'],
    'Supportive steps to version a package',
    {
      skipAdd: {alias: 'sa', type: 'boolean', default: false},
      withPendingChanges: {type: 'boolean', default: false},
    },
    async ({cwd, skipAdd, withPendingChanges}) => {
      if (withPendingChanges) {
        writePendingChangesToChangelog({cwd, pendingChangesFilePath})
        removePendingChanges({cwd, pendingChangesFilePath})
        writeReleaseEntryToChangelog(cwd)
        if (!skipAdd) {
          await gitAdd(pendingChangesFilePath)
          await gitAdd('CHANGELOG.md')
        }
      }
      // no commit here since it is implicitly handled as part of `yarn version`'s lifecycle script hooks
    },
  )
  .command(
    ['postversion'],
    'Supportive steps to after a package has been versioned',
    {
      recipient: {alias: 'r', type: 'string'},
      skipReleaseNotification: {alias: 'sr', type: 'boolean'},
    },
    async args => {
      try {
        console.log('[bongo postversion] pushing with tags')
        await gitPushWithTags()
        if (args.skipReleaseNotification) {
          console.log('[bongo postversion] skipping release notification')
        } else if (!args.skipReleaseNotification) {
          console.log('[bongo postversion] sending release notification')
          await sendReleaseNotification(args.cwd, args.recipient)
          console.log('[bongo postversion] release notification sent')
        }
        console.log('[bongo postversion] done!')
      } catch (err) {
        console.log(chalk.yellow(err.message))
      }
    },
  )
  .command(['lint', 'l'], 'Static code analysis ftw', {}, async ({cwd}) => await lint(cwd))
  .command(['verify-changelog', 'vch'], 'Verify changelog has unreleased entries', {}, ({cwd}) =>
    verifyChangelog(cwd),
  )
  .command(
    ['verify-commits', 'vco'],
    'Verify no unreleased changes for internal dependencies exist',
    {},
    async ({cwd}) => await verifyCommits({pkgPath: cwd}),
  )
  .command(
    ['verify-versions', 'vv'],
    'Verify consistent versions in relevant packages',
    {},
    async ({cwd}) => {
      try {
        verifyVersions({pkgPath: cwd})
      } catch (err) {
        console.log(chalk.yellow(err.message))
      }
    },
  )
  .command(
    ['verify-installed-versions', 'viv'],
    'Verify correct dependencies are installable',
    {},
    async ({cwd}) => {
      createDotFolder(cwd)
      await packInstall(cwd)
      await verifyInstalledVersions({
        pkgPath: cwd,
        installedDirectory: path.join('.bongo', 'dry-run'),
      })
    },
  )
  .command(
    ['ls-dry-run', 'ls'],
    'Display dependencies from a verify-installed-versions run',
    {},
    () => lsDryRun(),
  )
  .command(
    ['send-release-notification', 'hello-world'],
    'Send a notification that an sdk has been released',
    {recipient: {alias: 'r', type: 'string'}},
    async args => await sendReleaseNotification(args.cwd, args.recipient),
  )
  .command(
    ['deps', 'd'],
    'update internal deps',
    {
      commit: {type: 'boolean', default: false},
      upgradeAll: {type: 'boolean', default: false},
    },
    async args => {
      console.log('[bongo deps] running...')
      await deps(args)
      console.log('[bongo deps] updated deps. now committing...')
      await commitFiles(args)
      console.log('[bongo deps] done')
    },
  )
  .demandCommand(1, 'exit')
  .fail((msg, error, args) => {
    if (msg === 'exit') {
      return args.showHelp()
    }
    const command = process.argv[2]
    if (process.argv.includes('--verbose')) {
      console.log(error)
    } else {
      console.log(chalk.red(error.message))
      console.log(`run "npx bongo ${command} --verbose" to see stack trace`)
    }
    process.exit(1)
  })
  .wrap(yargs.terminalWidth())
  .help().argv

async function deps({cwd, upgradeAll}) {
  verifyUnfixedDeps(cwd)
  await yarnUpgrade({
    folder: cwd,
    upgradeAll,
  })
}

async function commitFiles({cwd, commit}) {
  if (commit) {
    console.log('[bongo] commit files running...\n', (await gitStatus()).stdout)
    const files = ['package.json', 'CHANGELOG.md', 'yarn.lock']
    for (const file of files) {
      // git add fails when trying to add files that weren't changed
      if (await isChanged(file)) {
        console.log(`[bongo] git add changed file: ${file}`)
        await gitAdd(file)
      }
    }

    // git commit fails when trying to commit files that weren't changed
    console.log(`[bongo] committing changed files:\n${(await gitStatus()).stdout}`)
    if (await isChanged(...files)) {
      const pkgName = JSON.parse(fs.readFileSync(path.resolve(cwd, 'package.json'))).name
      await gitCommit(`[auto commit] ${pkgName}: upgrade deps`)
      console.log(`[bongo] actually committed files`)
    }
  }
}
