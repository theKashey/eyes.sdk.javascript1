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
        unlink: {
          description: 'Unlink packages instead of linking them',
          type: 'boolean',
          default: false,
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
  include,
  exclude = [],
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
  runInstall = false,
  runBuild = true,
} = {}) {
  const manifest = await getManifest(packagePath)
  if (!manifest) process.exit(1)

  const packages = await getPackages(packagesPath)

  const dependencyNames = Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.optionalDependencies,
  })

  const dependencies = dependencyNames
    .filter(dependencyName => {
      return (
        packages.has(dependencyName) &&
        !exclude.includes(dependencyName) &&
        (!include || include.length <= 0 || include.includes(dependencyName))
      )
    })
    .map(dependencyName => packages.get(dependencyName))

  const executions = dependencies.map(dependency => {
    return new Promise(resolve => {
      const commands = [`yarn link`]
      if (runInstall) commands.push(`yarn install`)
      if (runBuild && dependency.hasBuild) commands.push(`yarn build`)
      commands.push(`cd ${packagePath}`, `yarn link ${dependency.name}`)
      exec(commands.join(' && '), {cwd: dependency.path}, error => {
        resolve({name: dependency.name, error})
      })
    })
  })

  const results = await Promise.all(executions)

  results.forEach(result => {
    if (result.error) {
      console.error(chalk.redBright(`${chalk.bold.yellow(result.name)} wasn't linked due to error`))
      console.error(result.error)
      process.exit(1)
    }
    console.log(chalk.greenBright(`${chalk.bold.cyan(result.name)} was successfully linked`))
  })
}

async function unlink({
  include,
  exclude = [],
  packagePath = process.cwd(),
  packagesPath = path.resolve(packagePath, '..'),
} = {}) {
  const manifest = await getManifest(packagePath)
  if (!manifest) {
    console.error(chalk.redBright('This script should be executed inside npm package'))
    process.exit(1)
  }

  const packages = await getPackages(packagesPath)

  const dependencyNames = Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.optionalDependencies,
  })

  const dependencies = dependencyNames
    .filter(dependencyName => {
      return (
        packages.has(dependencyName) &&
        !exclude.includes(dependencyName) &&
        (!include || include.includes(dependencyName))
      )
    })
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

async function getPackages(packagesPath) {
  const entries = await new Promise(resolve => {
    fs.readdir(packagesPath, (err, entries) => resolve(!err ? entries : []))
  })
  return entries.reduce(async (promise, entry) => {
    const packages = await promise
    const packagePath = path.resolve(packagesPath, entry)
    const manifest = await getManifest(packagePath)
    if (manifest) {
      packages.set(manifest.name, {
        name: manifest.name,
        path: packagePath,
        hasBuild: Boolean(manifest.scripts && manifest.scripts.build),
      })
    }
    return packages
  }, Promise.resolve(new Map()))
}
