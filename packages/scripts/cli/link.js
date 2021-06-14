#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const {exec} = require('child_process')
const yargs = require('yargs')

yargs
  .usage('yarn link [options]')
  .command({
    command: '*',
    builder: yargs =>
      yargs.options({
        unlink: {
          description: 'Unlink packages instead of linking them',
          type: 'boolean',
          default: false,
        },
        packagePath: {
          alias: ['package'],
          description: 'Path to the target package',
          type: 'string',
        },
        packagesPath: {
          alias: ['root'],
          description: 'Path to the root directory of the local packages',
          type: 'string',
        },
        runInstall: {
          alias: ['install'],
          description: 'Run `yarn install` before link package',
          type: 'boolean',
          default: false,
        },
        runBuild: {
          alias: ['build'],
          description: 'Run `yarn build` if needed before link package',
          type: 'boolean',
          default: true,
        },
        include: {
          description: 'Package names to link',
          type: 'array',
        },
        exclude: {
          description: 'Package names to not link',
          type: 'array',
        },
        maxDepth: {
          alias: ['depth'],
          type: 'number',
          default: 0,
        },
      }),
    handler: async args => {
      try {
        if (args.unlink) await unlink(args)
        else await link(args)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    },
  })
  .help().argv

async function link({
  include = [],
  exclude = [],
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
  runInstall = false,
  runBuild = true,
  maxDepth = 0,
} = {}) {
  const target = await getPackage(packagePath)
  if (!target) process.exit(1)

  const packages = await getPackages(packagesPath, {include, exclude})

  const results = await task(target, packages)

  results.forEach(result => {
    if (result.error) {
      console.error(
        chalk.redBright(
          `${chalk.bold.yellow(result.dependency.name)} wasn't linked to ${chalk.bold.yellow(
            result.target.name,
          )} due to error`,
        ),
      )
      console.error(result.error)
      console.error('STDOUT:', result.stdout)
      console.error('STDERR:', result.stderr)
    }
    console.log(
      chalk.greenBright(
        `${chalk.bold.cyan(result.dependency.name)} was successfully linked to ${chalk.bold.cyan(
          result.target.name,
        )}`,
      ),
    )
    console.error('STDOUT:', result.stdout)
  })

  results.forEach(result => result.error && process.exit(1))

  async function task(target, packages, {depth = 0} = {}) {
    const dependencies = target.dependencies
      .filter(dependencyName => packages.has(dependencyName))
      .map(dependencyName => packages.get(dependencyName))

    return dependencies.reduce(async (promise, dependency) => {
      const results = await promise
      let [result, ...nestedResults] = await new Promise(async resolve => {
        const nestedResults =
          depth < maxDepth ? await task(dependency, packages, {depth: depth + 1}) : []
        const commands = ['yarn link']
        if (runInstall) commands.push('yarn install')
        if (runBuild && dependency.hasBuild) commands.push('yarn build')
        exec(commands.join(' && '), {cwd: dependency.path}, async (error, stdout, stderr) => {
          resolve([{target, dependency, error, stdout, stderr}, ...nestedResults])
        })
      })
      if (!result.error) {
        result = await new Promise(resolve => {
          exec(`yarn link ${dependency.name}`, {cwd: target.path}, (error, stdout, stderr) => {
            resolve({target, dependency, error, stdout, stderr})
          })
        })
      }
      return results.concat(result, nestedResults)
    }, Promise.resolve([]))
  }
}

async function unlink({
  include = [],
  exclude = [],
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
} = {}) {
  const target = await getPackage(packagePath)
  if (!target) process.exit(1)

  const packages = await getPackages(packagesPath, [include, exclude])

  const dependencies = target.dependencies
    .filter(dependencyName => packages.has(dependencyName))
    .map(dependencyName => packages.get(dependencyName))

  const result = await new Promise(resolve => {
    const commands = [`yarn unlink ${dependencies.map(dependency => dependency.name).join(' ')}`]
    exec(commands.join(' && '), {cwd: packagePath}, error => resolve({error}))
  })

  if (result.error) {
    console.error(chalk.redBright('Something went wrong'))
    console.error(result.error)
    process.exit(1)
  }

  console.log(chalk.greenBright('All local dependencies are successfully unlinked'))
}

async function isFile(filePath) {
  return new Promise(resolve => {
    fs.stat(filePath, (err, stats) => resolve(!err ? stats.isFile() : false))
  })
}

async function getManifest(packagePath) {
  const manifestPath = path.resolve(packagePath, './package.json')
  if (!(await isFile(manifestPath))) return null
  return require(manifestPath)
}

async function getPackage(packagePath) {
  const manifest = await getManifest(packagePath)
  if (!manifest) return null
  return {
    name: manifest.name,
    alias: path.basename(packagePath),
    path: packagePath,
    dependencies: Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.optionalDependencies,
    }),
    hasBuild: Boolean(manifest.scripts && manifest.scripts.build),
  }
}

async function getPackages(packagesPath, {include = [], exclude = []} = {}) {
  const entries = await new Promise(resolve => {
    fs.readdir(packagesPath, (err, entries) => resolve(!err ? entries : []))
  })
  return entries.reduce(async (promise, entry) => {
    const data = await getPackage(path.resolve(packagesPath, entry))
    const packages = await promise

    if (
      !data ||
      exclude.some(name => name === data.name || name === data.alias) ||
      include.every(name => name !== data.name && name !== data.alias)
    ) {
      return packages
    }

    packages.set(data.name, data)
    return packages
  }, Promise.resolve(new Map()))
}
