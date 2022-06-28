#!/usr/bin/env node

const path = require('path')
const chalk = require('chalk')
const {execSync} = require('child_process')
const yargs = require('yargs')

yargs
  .usage('yarn up [package-name]')
  .command({
    command: '* [package-name]',
    builder: yargs =>
      yargs.options({
        packageName: {
          aliases: ['package', 'p'],
          description: 'Package name',
          type: 'string',
          require: true,
        },
        packageVersion: {
          aliases: ['up', 'pv'],
          description: 'Package version',
          type: 'string',
          default: 'latest',
        },
      }),
    handler: async args => {
      try {
        await up(args)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    },
  })
  .help().argv

async function up({packageName, packageVersion}) {
  const info = JSON.parse(execSync(`npm ls ${packageName} --json`, {encoding: 'utf8'}))

  return traverse(info.name, info.dependencies)

  function traverse(currentPackageName, dependencies, cwd = process.cwd()) {
    for (const [dependencyName, info] of Object.entries(dependencies)) {
      if (dependencyName === packageName) {
        execSync(`yarn upgrade --cwd ${cwd} ${packageName}@${packageVersion}`, {encoding: 'utf8'})
        console.log(
          chalk.greenBright(
            `${chalk.bold.cyan(packageName)} was successfully upgraded to version ${chalk.bold.cyan(
              packageVersion,
            )} in ${chalk.bold.cyan(currentPackageName)}`,
          ),
        )
      } else if (info.resolved.startsWith('file:')) {
        traverse(dependencyName, info.dependencies, path.resolve(cwd, 'node_modules', dependencyName))
      }
    }
  }
}
